import { Document, Packer, Paragraph, TextRun } from 'docx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportAsDocx = async (title: string, htmlContent: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  const paragraphs = Array.from(doc.body.childNodes).map(node => {
     return new Paragraph({
       children: [new TextRun({ text: node.textContent || '' })],
       spacing: { after: 200 }
     })
  })

  // Basic conversion to docx
  const wordDoc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 36 })], spacing: { after: 400 } }),
        ...paragraphs
      ]
    }]
  })

  const blob = await Packer.toBlob(wordDoc)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${title}.docx`
  link.click()
  URL.revokeObjectURL(url)
}

export const exportAsPdf = async (title: string, elementId: string) => {
  const element = window.document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  
  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const imgData = canvas.toDataURL('image/png')
  
  const pdf = new jsPDF('p', 'mm', 'a4')
  let position = 0
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  
  // Handing multiple pages if note is long
  let heightLeft = imgHeight - pageHeight
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }
  
  pdf.save(`${title}.pdf`)
}
