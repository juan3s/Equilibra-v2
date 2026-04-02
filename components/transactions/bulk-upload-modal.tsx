'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTransactionUIStore } from '@/lib/stores/transaction-filters.store'
import { useAccounts, useCategories, useCurrencies } from '@/lib/hooks/use-reference-data'
import { useCurrentUser } from '@/components/layout/user-provider'
import { createClient } from '@/lib/supabase/client'

type ParsedRow = Record<string, string>

export function BulkUploadModal() {
  const { isBulkUploadOpen, closeBulkUpload } = useTransactionUIStore()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { userId } = useCurrentUser()
  const queryClient = useQueryClient()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bankAccountId, setBankAccountId] = useState('')
  const [currencyCode, setCurrencyCode] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)

    Papa.parse<ParsedRow>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields ?? [])
        setPreview(results.data.slice(0, 5))
      },
      error: () => {
        setError('No se pudo leer el archivo CSV. Verifica el formato.')
        setFile(null)
        setPreview([])
        setHeaders([])
      },
    })
  }

  const handleSubmit = async () => {
    if (!file || !bankAccountId || !currencyCode || !categoryId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bank_account_id', bankAccountId)
      formData.append('currency_code', currencyCode)
      formData.append('category_id', categoryId)

      const { error: fnError } = await supabase.functions.invoke('process-batch-upload', {
        body: formData,
      })

      if (fnError) throw fnError

      await queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
      handleClose()
    } catch {
      setError('Error al procesar el archivo. Verifica el formato e intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setHeaders([])
    setBankAccountId('')
    setCurrencyCode('')
    setCategoryId('')
    setError(null)
    closeBulkUpload()
  }

  const canSubmit = Boolean(file && bankAccountId && currencyCode && categoryId)

  return (
    <Dialog open={isBulkUploadOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Importar transacciones desde CSV</DialogTitle>
          <DialogDescription>
            Selecciona un archivo CSV y configura los valores por defecto para las
            transacciones importadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File drop zone */}
          <div className="space-y-1">
            <Label>Archivo CSV</Label>
            <div
              className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file ? (
                  <span className="text-foreground font-medium">{file.name}</span>
                ) : (
                  'Haz clic para seleccionar un archivo CSV'
                )}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Default values */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Cuenta bancaria</Label>
              <Select value={bankAccountId} onValueChange={(v) => setBankAccountId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Moneda</Label>
              <Select value={currencyCode} onValueChange={(v) => setCurrencyCode(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Categoría por defecto</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-1">
              <Label>Vista previa — primeras {preview.length} filas</Label>
              <div className="rounded-md border border-border overflow-auto max-h-48">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h) => (
                        <TableHead key={h} className="text-xs whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((h) => (
                          <TableCell key={h} className="text-xs whitespace-nowrap">
                            {row[h]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Importando...' : 'Importar transacciones'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
