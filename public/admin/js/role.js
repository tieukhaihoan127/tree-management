// Change Status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonChangeStatus.length > 0){
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");

    buttonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            let statusChange = statusCurrent == "active" ? "inactive" : "active";
            const action = path + `/${statusChange}/${id}?_method=PATCH`;
            formChangeStatus.action = action;
            formChangeStatus.submit();
        });
    });
}
// End Change Status

// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0){
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này?");
            if(isConfirm){
                const id = button.getAttribute("data-id");
                const action =  `${path}/${id}?_method=DELETE`;

                formDeleteItem.action = action;
                formDeleteItem.submit();
            }
        });
    });
}
// End Delete Item

// Permissions
const tablePermissions = document.querySelector("[table-permissions]");
if(tablePermissions) {
  const buttonSubmit = document.querySelector("[button-submit]");

  buttonSubmit.addEventListener("click", () => {
    let permissions = [];

    const rows = tablePermissions.querySelectorAll("[data-name]");

    rows.forEach(row => {
      const name = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");

      if(name == "id") {
        inputs.forEach(input => {
          const id = input.value;
          permissions.push({
            id: id,
            permissions: []
          });
        })
      } else {
        inputs.forEach((input, index) => {
          const checked = input.checked;

          // console.log(name);
          // console.log(index);
          // console.log(checked);
          // console.log("-------------");

          if(checked) {
            permissions[index].permissions.push(name);
          }
        });
      }
    });

    console.log(permissions);

    if(permissions.length > 0) {
      const formChangePermissions = document.querySelector("#form-change-permissions");
      const inputPermissions = formChangePermissions.querySelector("input[name='permissions']");
      inputPermissions.value = JSON.stringify(permissions);
      formChangePermissions.submit();
    }
  });
}
// End Permissions

// Permissions Data Default
const dataRecords = document.querySelector("[data-records]");
if(dataRecords) {
  const records = JSON.parse(dataRecords.getAttribute("data-records"));

  const tablePermissions = document.querySelector("[table-permissions]");

  records.forEach((record, index) => {
    const permissions = record.permissions;

    permissions.forEach(permission => {
      const row = tablePermissions.querySelector(`[data-name="${permission}"]`);
      const input = row.querySelectorAll("input")[index];

      input.checked = true;
    });
  })
}
// End Permissions Data Default