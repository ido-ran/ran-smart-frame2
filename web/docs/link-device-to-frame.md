# Link device to a frame

## Definitions

* **Device** can be mobile or TV running Android.
* **Frame** is the information required to download photos of a frame

## How it works?

```

Device          Backend             Admin           DB
  |
  | Start Link ---->|
  |                 | --- Create link entity ------>|
  | <-- Return ID --|
  | <Present ID>
  | -- Pool ------->|
  |                 |                   | <Login>
  |                 |                   | <Select Frame>
  |                 |<-Enter Link ID -- |
  |                 | -- Set Frame ID on Link ----->|
  |-- Pool -------->|
  |<-Get Frame Data-|
```
