// db.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();


const connection = mysql.createConnection(
  'mysql://avnadmin:AVNS_sB-amvkES18PkwVlL_v@mysql-1c5d2357-bdnegocios.e.aivencloud.com:22359/bdmynegocio'
);

connection.connect(err => {
  if (err) {
    console.error('Error de conexion a BD:', err.stack);
    return;
  }
  console.log('Connectado a MySQL', connection.threadId);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

const getData = () => {
  return new Promise((resolve, reject) => {
    const query = 'Select IdCategoria,NombreCategoria from categoria';
    connection.query(query, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

function getNombCat(idcat) {
    return new Promise((resolve, reject) => {
        connection.query('Select NombreCategoria from categoria where IdCategoria=?',[idcat], (err, results) => {
            if (err) return reject(err);
            resolve(results); 
        });
    });
};


function getPedido(idped) {
    return new Promise((resolve, reject) => {
        connection.query('Select * from vistapedido where IdPedido=?;',[idped], (err, results) => {
            if (err) return reject(err);
            resolve(results); 
        });
    });
};

function getTableData(idcat) {
    return new Promise((resolve, reject) => {
        connection.query('Select IdProducto,NombreProducto,CantidadPorUnidad,PrecioUnidad from producto where IdCategoria=?',[idcat], (err, results) => {
            if (err) return reject(err);
            resolve(results); 
        });
    });
};

function getTableDetalle(idped) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT *,  ROW_NUMBER() OVER (ORDER BY IdPedido) AS Item FROM vistadetalle  where IdPedido=?',[idped], (err, results) => {
            if (err) return reject(err);
            resolve(results); 
        });
    });
};

// =========================
// PRODUCTOS
// =========================

function getProductos() {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM producto',
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function insertarProducto(
  IdProducto,
  NombreProducto,
  IdProveedor,
  IdCategoria,
  CantidadPorUnidad,
  PrecioUnidad,
  UnidadesEnExistencia,
  UnidadesEnPedido,
  NivelNuevoPedido,
  Suspendido,
  Descuento
) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO producto
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        IdProducto,
        NombreProducto,
        IdProveedor,
        IdCategoria,
        CantidadPorUnidad,
        PrecioUnidad,
        UnidadesEnExistencia,
        UnidadesEnPedido,
        NivelNuevoPedido,
        Suspendido,
        Descuento
      ],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function eliminarProducto(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      'DELETE FROM producto WHERE IdProducto=?',
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

// =========================
// CLIENTES
// =========================

function getClientes() {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM cliente',
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function insertarCliente(
  IdCliente,
  NombreEmpresa,
  NombreContacto,
  CargoContacto,
  Direccion,
  Ciudad,
  Region,
  CodPostal,
  Pais,
  Telefono,
  Fax
) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO cliente
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        IdCliente,
        NombreEmpresa,
        NombreContacto,
        CargoContacto,
        Direccion,
        Ciudad,
        Region,
        CodPostal,
        Pais,
        Telefono,
        Fax
      ],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function eliminarCliente(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      'DELETE FROM cliente WHERE IdCliente=?',
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

// =========================
// EMPLEADOS
// =========================

function getEmpleados() {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM empleado',
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function insertarEmpleado(
  IdEmpleado,
  Apellidos,
  Nombre,
  Cargo,
  Tratamiento,
  FechaNacimiento,
  FechaContratacion,
  Direccion,
  Ciudad,
  Region,
  CodPostal,
  Pais,
  TelDomicilio,
  Extension,
  Foto,
  Notas
) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO empleado
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        IdEmpleado,
        Apellidos,
        Nombre,
        Cargo,
        Tratamiento,
        FechaNacimiento,
        FechaContratacion,
        Direccion,
        Ciudad,
        Region,
        CodPostal,
        Pais,
        TelDomicilio,
        Extension,
        Foto,
        Notas,
        Jefe
      ],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function eliminarEmpleado(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      'DELETE FROM empleado WHERE IdEmpleado=?',
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  getData,
  getTableData,
  getNombCat,
  getPedido,
  getTableDetalle,

  getProductos,
  insertarProducto,
  eliminarProducto,

  getClientes,
  insertarCliente,
  eliminarCliente,

  getEmpleados,
  insertarEmpleado,
  eliminarEmpleado
};