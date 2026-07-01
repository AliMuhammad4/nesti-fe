const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getClientProfile() {
  const response = await fetch(`${API_URL}/api/client/profile/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.json();
}

export async function saveClientProfile(profileData) {
  const response = await fetch(`${API_URL}/api/client/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(profileData),
  });
  return response.json();
}

export async function getClientSubscription() {
  const response = await fetch(`${API_URL}/api/client/subscription/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.json();
}

export async function createClientCheckout(tier) {
  const response = await fetch(`${API_URL}/api/client/subscription/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ tier }),
  });
  return response.json();
}

export async function cancelClientSubscription() {
  const response = await fetch(`${API_URL}/api/client/subscription/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.json();
}
