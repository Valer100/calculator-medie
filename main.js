const caseta_note = document.querySelector("#note");
const caseta_medie_vruta = document.querySelector("#medieVruta");
const text_medie = document.querySelector("#medie");
const copiere_link = document.querySelector("#copiereLink");
const link_copiat = document.querySelector("#linkCopiat");

let note_vechi = "";
let medie_vruta_veche = "";

function format_potrivit(numar) {
    if (numar === Math.trunc(numar)) return String(Math.trunc(numar));
    return numar.toFixed(2).replace(".", ",");
}

function string_la_int(s) {
    if (typeof s !== "string" || !/^\s*[+-]?\d+\s*$/.test(s)) {
        throw new Error(`invalid literal for int(): '${s}'`);
    }
    return parseInt(s, 10);
}

function string_la_int_sau_null(s) {
    if (typeof s !== "string" || !/^\s*[+-]?\d+\s*$/.test(s)) return null;
    return parseInt(s, 10);
}

function calculeaza(event) {
    if (caseta_note.value === "") {
        text_medie.innerHTML = "<highlight class=\"bad\">Nu ai introdus note. Introdu câteva note și încearcă din nou.</highlight>";
        copiere_link.style.display = "none";
        link_copiat.style.display = "none";
        
        return;
    }

    if (caseta_note.value !== note_vechi || caseta_medie_vruta.value !== medie_vruta_veche) {
        note_vechi = caseta_note.value;
        medie_vruta_veche = caseta_medie_vruta.value;
        copiere_link.style.display = "none";
        link_copiat.style.display = "none";

        try {
            let note = caseta_note.value.split(", ");

            const lungimeInitiala = note.length;
            for (let i = 0; i < lungimeInitiala; i++) {
                const scurtatura_note_de_acelasi_fel = note[i].split("x");

                if (scurtatura_note_de_acelasi_fel.length === 2) {
                    note[i] = scurtatura_note_de_acelasi_fel[0];

                    const repetitii = string_la_int(scurtatura_note_de_acelasi_fel[1]);
                    for (let j = 0; j < repetitii - 1; j++) {
                        note.push(scurtatura_note_de_acelasi_fel[0]);
                    }
                }
            }

            const note_ca_numere = note.map(string_la_int);
            if (Math.min(...note_ca_numere) < 1 || Math.max(...note_ca_numere) > 10) {
                text_medie.innerHTML = "<highlight class=\"bad\">Au fost găsite note care nu se află în intervalul [1, 10]. Corectează problema și apoi încearcă din nou.</highlight>";
                return;
            }

            let media_vruta = string_la_int_sau_null(caseta_medie_vruta.value);

            let suma_notelor = 0;
            for (const nota of note) suma_notelor += string_la_int(nota);

            const media = suma_notelor / note.length;
            const media_rotunjita = Math.floor(0.5 + media);

            if (media_vruta === null) {
                if (media_rotunjita < 5) media_vruta = 5;
                else if (media_rotunjita > 4 && media_rotunjita !== 10) media_vruta = media_rotunjita + 1;
            }

            let informatii_reparare = "";

            if (media_vruta !== null) {
                informatii_reparare = "<br><br>";

                if (media_vruta <= 0 || media_vruta < 5 || media_vruta > 10) {
                    informatii_reparare += "<highlight class=\"bad\">Media dorită trebuie să fie între 5 și 10." +
                        (media_vruta > 0 && media_vruta < 5 ? `<br>De ce ai vrea media ${media_vruta}?` : "") +
                        "</highlight>";
                } else if (media_rotunjita > media_vruta) {
                    informatii_reparare += "Media calculată este mai mare decât cea dorită. Nu mai trebuie luate alte măsuri.";
                } else if (media_rotunjita === media_vruta) {
                    informatii_reparare += "Media calculată este aceeași cu cea dorită. Nu mai trebuie luate alte măsuri.";
                } else {
                    const note_ok = [5, 6, 7, 8, 9, 10];

                    if (note.length < 10) {
                        let ridicari = "";

                        for (const nota_ok of note_ok) {
                            const copie_note = note.slice();
                            let note_necesare = 0;

                            while (copie_note.length <= 10) {
                                copie_note.push(String(nota_ok));
                                note_necesare += 1;

                                let suma_note = 0;
                                for (const nota of copie_note) suma_note += string_la_int(nota);

                                const media_reparata = suma_note / copie_note.length;

                                if (Math.floor(0.5 + media_reparata) >= media_vruta) {
                                    const areDeja = note.filter(n => n === String(nota_ok)).length >= 1;
                                    const cantitate = note_necesare > 1 ? `${note_necesare} de` : "un";
                                    ridicari += `<br>- luând ${areDeja ? "încă " : ""}${cantitate} ${nota_ok} (vei avea ${format_potrivit(media_reparata)});`;
                                    break;
                                }
                            }
                        }

                        ridicari = (ridicari + ";").replace(";;", ".");

                        const numarLinii = (ridicari.match(/<br>/g) || []).length;
                        if (numarLinii === 1) {
                            informatii_reparare += `O poți ridica la ${media_vruta} ${ridicari.replace(/^<br>- /, "")}`;
                        } else if (numarLinii > 1) {
                            informatii_reparare += `O poți ridica la ${media_vruta} astfel:<br>` + ridicari;
                        } else {
                            informatii_reparare += `Din păcate, nu mai poți să ți-o ridici la ${media_vruta}.`;
                        }
                    } else {
                        informatii_reparare += `Din păcate, nu mai poți să ți-o ridici la ${media_vruta}.<br>Ai deja prea multe note.`;
                    }
                }
            }

            const pictograma_rea = `<span class="iconify" data-icon="ph:warning-fill" data-width="20" data-height="20" style="color: var(--color-bad); width: 20px; height: 20px;"></span>`;
            const pictograma_buna = `<span class="iconify" data-icon="gravity-ui:circle-check-fill" data-width="20" data-height="20" style="color: var(--color-good); width: 20px; height: 20px;"></span>`;
            const antet = media_rotunjita < 5 ? `class="bad">${pictograma_rea}` : `class="good">${pictograma_buna}`;
            const textul_mediei = format_potrivit(media) + (media !== media_rotunjita ? ` (${media_rotunjita})` : "");

            text_medie.innerHTML = `<highlight ${antet}&nbsp;&nbsp;Media ta este de ${textul_mediei}.` +
                (media_rotunjita < 5 ? " Ai grijă!" : "") +
                `</highlight>` + informatii_reparare;
            copiere_link.style.display = "block";
        } catch (e) {
            console.log(e);
            text_medie.innerHTML = "<highlight class=\"bad\">Ceva nu a mers bine la calcularea mediei. Asigură-te că ai introdus notele cum trebuie și încearcă din nou.</highlight>";
        }
    }

    const url = new URL(window.location.href);
    url.searchParams.set("note", caseta_note.value.replace(/, /g, ","));
    url.searchParams.set("medieVruta", caseta_medie_vruta.value);
    window.history.replaceState(null, "", url.href);
}

function sterge_tot(event) {
    caseta_note.value = "";
    caseta_medie_vruta.value = "";
    text_medie.innerText = "Informațiile despre medie și mărirea ei vor apărea aici.";

    copiere_link.style.display = "none";
    link_copiat.style.display = "none";

    const url = new URL(window.location.href);
    url.searchParams.delete("note");
    url.searchParams.delete("medieVruta");

    window.history.replaceState(null, "", url.href);
}

function copiaza_linkul(event) {
    try {
        navigator.clipboard.writeText(window.location.href);
        document.querySelector("#linkCopiat").style.display = "block";
    } catch (e) {
        console.log(e);
    }
}

function comenzi_rapide(event) {
    if (event.key === "Enter") calculeaza(null);
}

document.addEventListener("keydown", comenzi_rapide);

document.querySelector("#calculate").addEventListener("click", () => calculeaza(null));
document.querySelector("#clear").addEventListener("click", () => sterge_tot(null));
document.querySelector("#copy").addEventListener("click", () => copiaza_linkul(null));

try {
    const parametrii = new URLSearchParams(window.location.search);

    caseta_note.value = parametrii.get("note").replace(/,/g, ", ");
    caseta_medie_vruta.value = parametrii.get("medieVruta");

    calculeaza(null);
} catch (e) {
    console.log(e);
}
