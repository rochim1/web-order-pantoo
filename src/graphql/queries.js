import gql from 'graphql-tag'

export const GET_TABLE_CONTEXT = gql`
  query GetPOSTablePublic($instansi_id: ID!, $toko_id: ID!, $table_id: ID!) {
    GetPOSTablePublic(instansi_id: $instansi_id, toko_id: $toko_id, table_id: $table_id) {
      _id
      name
      capacity
      area
      floor
      location_note
      status
      available
      require_customer
    }
  }
`

export const GET_MENU = gql`
  query GetPOSMenuPublic($instansi_id: ID!, $toko_id: ID!) {
    GetPOSMenuPublic(instansi_id: $instansi_id, toko_id: $toko_id) {
      _id
      nama
      kode
      kategori
      harga_jual
      gambar
      deskripsi
      stok
      status
      preparation_mode
      prep_time_minutes
    }
  }
`

export const CREATE_ORDER = gql`
  mutation CreatePOSOrderPublic(
    $instansi_id: ID!
    $toko_id: ID!
    $table_id: ID!
    $pelanggan_nama: String
    $items: [POSOrderItemInput!]!
    $catatan: String
    $client_request_id: String
  ) {
    CreatePOSOrderPublic(
      instansi_id: $instansi_id
      toko_id: $toko_id
      table_id: $table_id
      pelanggan_nama: $pelanggan_nama
      items: $items
      catatan: $catatan
      client_request_id: $client_request_id
    ) {
      _id
      order_no
      status
      grand_total
      public_token
    }
  }
`

export const GET_ORDER_STATUS = gql`
  query GetPOSOrderPublic($instansi_id: ID!, $toko_id: ID!, $order_id: ID!, $public_token: String) {
    GetPOSOrderPublic(instansi_id: $instansi_id, toko_id: $toko_id, order_id: $order_id, public_token: $public_token) {
      _id
      order_no
      status
      status_pembayaran
      items {
        nama
        qty
        harga_satuan
        subtotal
        preparation_mode
        production_station_name
        production_status
        prep_time_minutes
      }
      grand_total
      table {
        name
      }
      createdAt
    }
  }
`
