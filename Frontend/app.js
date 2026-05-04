function loadUsers() {
    fetch('/api/users')
      .then(res => res.json())
      .then(users => {
        document.getElementById('user-count').textContent = users.length
        const tbody = document.getElementById('user-table')
        tbody.innerHTML = ''
        users.forEach(user => {
          tbody.innerHTML += `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td><span class="badge badge-green">Active</span></td>
            </tr>`
        })
      })
      .catch(err => console.error('API Error:', err))
  }
  
  loadUsers()