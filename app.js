// app.js

const path = require('path');
const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { getData } = require('./db');
const { getTableData } = require('./db');
const { getNombCat } = require('./db');
const { getPedido } = require('./db');
const { getTableDetalle } = require('./db');
const session = require('express-session');
const {
  getProductos,
  insertarProducto,
  eliminarProducto,

  getClientes,
  insertarCliente,
  eliminarCliente,

  getEmpleados,
  insertarEmpleado,
  eliminarEmpleado
} = require('./db');

const app = express();

app.use(session({ 
  secret: 'ucss_lp2', 
  resave: false, 
  saveUninitialized: false 
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

const port = 3000;

const PDFDocumentWithTables = require('pdfkit-table'); // Use the table plugin
const { constants } = require('buffer');


app.get('/Rpt_Categorias', async (req, res) => {
  try {
    const data = await getData();
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Categorias.pdf"'); // Force download
    doc.pipe(res); 
    doc.fontSize(25).text('Categorias', 
      { align: 'center' }).moveDown();
    doc.fontSize(12);
    data.forEach(item => {
      doc.text(` ${item.IdCategoria}      ${item.NombreCategoria}`);
    });
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando PDF');
  }
  
});


app.post('/Rpt_Productos', async (req, res) => {
  try {
    res.set('Accept-Ranges', 'none');
    const scat = req.session.sCat; 
console.log("------------------------ ",scat);
    const idcat = scat.idcat;

    const NombCat= scat.nombcat;
    const data = await getTableData(idcat);
    const doc = new PDFDocumentWithTables(); // Initialize with the table plugin's class
     const pdfPath = path.join(__dirname, 'Pedido.pdf');
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.pipe(fs.createWriteStream('./Productos_Cat.pdf')); // Pipe to a file
    doc.fontSize(25).text(NombCat, { align: 'center' }).moveDown();
      
    const table = {
        headers: ["ID", "Producto", "Presentacion", "Precio"],
        rows: data.map(row => [row.IdProducto,
          row.NombreProducto , 
          row.CantidadPorUnidad, 
          row.PrecioUnidad]),
    };
    await doc.table(table, {
        width: 500,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(15),
        columnsSize: [ 50, 200, 200,50 ],
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(14);
        indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? 'blue' : 'green'), 0.05);
  }
    });

    doc.end(); 
//    console.log("Generado Productos_Cat.pdf");
//    console.log(__dirname);

    stream.on('finish', () => {
  res.sendFile(pdfPath, (err) => {
    if (err) {
      console.error('Error enviando PDF:', err);
      res.status(500).send('Error cargando PDF.');
    }
  });
});

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando PDF');
  }
});

app.post('/Rpt_Pedidos', async (req, res) => {
  try {
    res.set('Accept-Ranges', 'none');
    const idPed = req.body.txtIdPed;
    const RegPed = await getPedido(idPed);
    //console.log(RegPed);
    const data = await getTableDetalle(idPed);
   //console.log(data);
    const doc = new PDFDocumentWithTables();
    const pdfPath = path.join(__dirname, 'Pedido.pdf');
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.pipe(fs.createWriteStream('./Pedido.pdf'));
    doc.fontSize(11).moveDown();
    doc.text(`PEDIDO: ${RegPed[0].IdPedido}`, 50, 100);  
    doc.text(`FECHA: ${RegPed[0].FechaPedido}`, 430, 100);  
    doc.moveDown();
    doc.text(``, 50, 130);  
    const table = {
        headers: ["Item", "Producto", "Presentacion", "Precio","Cantidad","Imp.Comp.","Imp.Dscto.","Imp.Vta."],
        rows: data.map(row => [row.Item,
          row.NombreProducto , 
          row.CantidadPorUnidad, 
          row.PrecioUnidad,
          row.Cantidad,
          row.ImpCompra,
          row.ImpDscto,
          row.ImpVta
        ]),
    };
    await doc.table(table, {
        width: 500,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        columnsSize: [ 30, 120, 75,55,55,55,55,55 ],
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(10);
        indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? 'blue' : 'green'), 0.05);
  }
    });

    doc.end(); 
      stream.on('finish', () => {
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error('Error enviando PDF:', err);
        res.status(500).send('Error cargando PDF.');
      }
    });
  });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando PDF');
  }
});

app.get('/', async (req, res) => {
  try {

    res.render('MenuH', {

    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Error en reportes');
  }
});

app.get('/presCatelogo', async (req, res) => {
  try {
    const IdCat = 0;
    const NombCat = "";
    const Categorias = await getData();
    const Productos =[];
    res.render('Catalogo', {
      Categorias,
      IdCat,
      NombCat,
      Productos
    });

  } catch (error) {
    console.error('🚨 Error al obtener categorías:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.post('/presCatalogo', async (req, res) => {
  try {
    const idCat1 = req.body.cboCategoria;
    const idCat2 = req.body.idCatx;
    let IdCat=idCat1;
    if(IdCat==0) IdCat=idCat2;
    const Categorias = await getData();
    const Productos = await getTableData(IdCat);
    const NombCat = Categorias[IdCat - 1]?.NombreCategoria || "";

    req.session.sCat = { idcat: IdCat, nombcat: NombCat }; 

    res.render('Catalogo', {
      Categorias:Categorias,
      IdCat,
      NombCat,
      Productos,
    });

  } catch (error) {
    console.error('🚨 Error al procesar el pedido:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/BuscarPedido', (req, res) => {
  res.render('BuscarPedido', {
    pedido: null,
    detalle: []
  });
});


app.post('/BuscarPedido', async (req, res) => {
  try {
    const idPedido = req.body.txtIdPed;


    const pedido = await getPedido(idPedido);
    const detalle = await getTableDetalle(idPedido);


    res.render('BuscarPedido', {
      pedido,
      detalle
    });


  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar pedido');
  }
});

app.get('/', (req, res) => {
  res.render('MenuH');
});

app.get('/pedidos', (req, res) => {
  res.redirect('/BuscarPedido');
});

app.get('/contacto', (req, res) => {
  res.render('Contacto');
});

app.get('/producto', async (req, res) => {

  const Productos = await getProductos();

  res.render('Producto', {
    Productos
  });

});

app.post('/InsertarProducto', async (req, res) => {

  await insertarProducto(
    req.body.IdProducto,
    req.body.NombreProducto,
    req.body.IdProveedor,
    req.body.IdCategoria,
    req.body.CantidadPorUnidad,
    req.body.PrecioUnidad,
    req.body.UnidadesEnExistencia,
    req.body.UnidadesEnPedido,
    req.body.NivelNuevoPedido,
    req.body.Suspendido,
    req.body.Descuento
  );

  res.redirect('/producto');

});

app.post('/EliminarProducto/:id', async (req, res) => {

  await eliminarProducto(req.params.id);

  res.redirect('/producto');

});

app.get('/cliente', async (req, res) => {

  const Clientes = await getClientes();

  res.render('Cliente', {
    Clientes
  });

});

app.post('/InsertarCliente', async (req, res) => {

  await insertarCliente(
    req.body.IdCliente,
    req.body.NombreEmpresa,
    req.body.NombreContacto,
    req.body.CargoContacto,
    req.body.Direccion,
    req.body.Ciudad,
    req.body.Region,
    req.body.CodPostal,
    req.body.Pais,
    req.body.Telefono,
    req.body.Fax
  );

  res.redirect('/cliente');

});

app.post('/EliminarCliente/:id', async (req, res) => {

  await eliminarCliente(req.params.id);

  res.redirect('/cliente');

});

app.get('/empleado', async (req, res) => {

  const Empleados = await getEmpleados();

  res.render('Empleado', {
    Empleados
  });

});

app.post('/InsertarEmpleado', async (req, res) => {

  await insertarEmpleado(
    req.body.IdEmpleado,
    req.body.Apellidos,
    req.body.Nombre,
    req.body.Cargo,
    req.body.Tratamiento,
    req.body.FechaNacimiento,
    req.body.FechaContratacion,
    req.body.Direccion,
    req.body.Ciudad,
    req.body.Region,
    req.body.CodPostal,
    req.body.Pais,
    req.body.TelDomicilio,
    req.body.Extension,
    req.body.Foto,
    req.body.Notas
  );

  res.redirect('/empleado');

});

app.post('/EliminarEmpleado/:id', async (req, res) => {

  await eliminarEmpleado(req.params.id);

  res.redirect('/empleado');

});

app.listen(port, () => {
  console.log(`Servidor escuchando en  http://localhost:${port}`);
});