const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const facture = async (req, res) => {
    try {
        const { vendeur, client, facture, articles, totalHT, totalTVA, totalTTC } = req.body;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Disposition', 'attachment; filename="facture.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Titre
    doc.fontSize(26).fillColor('#0057b7').text('Facture', { align: 'left' }).moveDown(1);

    // Infos vendeur
    doc.fontSize(12).fillColor('#000').text(`Vendeur: ${vendeur.nom}`, 50, doc.y);
    doc.text(vendeur.adresse, 50, doc.y).moveDown(1);

    // Infos client
    doc.fontSize(12).text(`Client: ${client.nom}`, 300, doc.y);
    doc.text(client.adresse, 300, doc.y).moveDown(1);

    // Infos facture
    doc.fontSize(10).text(`Date: ${facture.date}`, 50, doc.y);
    doc.text(`N° Facture: ${facture.numero}`, 200, doc.y);
    doc.text(`Échéance: ${facture.echeance}`, 350, doc.y).moveDown(2);

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(2);

    // Tableau des articles
    doc.fontSize(12).text('Description', 50, doc.y, { bold: true });
    doc.text('Quantité', 200, doc.y);
    doc.text('Prix Unitaire HT', 300, doc.y);
    doc.text('Total HT', 400, doc.y);
    doc.moveDown();

    articles.forEach(article => {
        doc.text(article.description, 50, doc.y);
        doc.text(article.quantite.toString(), 200, doc.y);
        doc.text(article.prixHT.toFixed(2) + ' €', 300, doc.y);
        doc.text(article.totalHT.toFixed(2) + ' €', 400, doc.y);
        doc.moveDown();
    });

    // Totaux
    doc.moveDown(2);
    doc.text(`Total HT: ${totalHT.toFixed(2)} Ar`, 400, doc.y);
    doc.text(`Total TVA: ${totalTVA.toFixed(2)} Ar`, 400, doc.y);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} Ar`, 400, doc.y).moveDown(2);

    doc.end();
}catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
}
}    
    
module.exports=facture;