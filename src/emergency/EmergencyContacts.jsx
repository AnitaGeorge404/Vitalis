import { useState, useEffect } from "react";

function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved data
  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("emergencyContacts"));
    if (savedContacts && savedContacts.length > 0) {
      setContacts(savedContacts);
      setIsSetupDone(true);
    }
  }, []);

  // Save data
  const saveSetup = () => {
    if (contacts.length === 0) return alert("Add at least one contact");

    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    setIsSetupDone(true);
    setIsEditing(false);
  };

  const addContact = () => {
    if (!name || !phone) return;
    setContacts([...contacts, { name, phone }]);
    setName("");
    setPhone("");
  };

  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const triggerSOS = () => {
    if (contacts.length === 0) {
      alert("Add at least one emergency contact first!");
      return;
    }

    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

        const message = `
EMERGENCY 🚨
I need help immediately.
Location: ${mapLink}
        `;

        // Open WhatsApp for all contacts
        contacts.forEach((contact) => {
          if (contact.phone) {
            window.open(
              `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`,
              "_blank"
            );
          }
        });

        // Auto-dial emergency number as fallback
        window.location.href = "tel:112";
      },
      (err) => {
        alert("Unable to get location. Please allow location access.");
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="feature-page" style={{ padding: "1rem" }}>
      <h1>📞 Smart Emergency Contacts</h1>
      <p>Quick alert system for emergency contacts</p>

      {!isSetupDone || isEditing ? (
        <div style={{ marginTop: "1rem" }}>
          <h2>Setup Emergency Contacts</h2>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <input
            placeholder="Phone (+91...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={addContact}>Add Contact</button>

          <ul>
            {contacts.map((c, i) => (
              <li key={i}>
                {c.name} - {c.phone}{" "}
                <button onClick={() => removeContact(i)}>Remove</button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={saveSetup}>Save Setup</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          <h2>Emergency Ready</h2>
          <button
            style={{
              background: "red",
              color: "white",
              padding: "20px",
              fontSize: "20px",
              marginRight: "1rem",
            }}
            onClick={triggerSOS}
          >
            🚨 SOS
          </button>
          <button
            style={{
              padding: "10px 15px",
              fontSize: "16px",
            }}
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Contacts
          </button>
        </div>
      )}
    </div>
  );
}

export default EmergencyContacts;
