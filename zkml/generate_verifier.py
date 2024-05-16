
import os
from sindri import Sindri
sindri = Sindri(os.getenv("SINDRI_API_KEY", "sindri_LIGfsK27MJRV4ngpqQkj3rgpNLlRTA4d_0CdU"))
circuit_id = "4ac3da9b-ef5c-423e-9ed6-e505e2eb19a3"
smart_contract_code = sindri.get_smart_contract_verifier(circuit_id)
with open("Verifier.sol", "w") as f:
    f.write(smart_contract_code)