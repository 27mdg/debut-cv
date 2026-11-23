# Debut CV

A free CV builder that aims to be the most complete and the most honest one you can use: fill in
a form, pick a design and download your CV as a PDF. No sign-up, no watermark, no payment, and no
data leaving your browser.

> **Status:** in active development, not launched yet. The interface is in Spanish first; the
> CV itself can already be written in Spanish or British English.

## Principles

- **Free for good.** Every feature is available to everyone. There is no paywall at the
  download step and no watermark on the PDF.
- **Private by design.** The PDF is built in your browser and your CVs are stored only there.
  Nothing is sent to a server, not even the photo or the signature. There is no account.
- **Deterministic.** What you type is what you get: form → data → design → PDF. No generated
  text, no hidden services.
- **Made to get read.** The PDF has real, selectable text in reading order, so recruiting
  software can read it: no images of text, no wide letter spacing, no hyphenation, the name read
  first, and a drawn skill level always comes with its word.
- **Open licences only.** Fonts are open-licence and served from the site itself; icons and
  drawings are our own SVG.

## Features

### Writing your CV
- **Every common section:** profile, experience, education, skills, languages, courses,
  internships, extracurricular activities, certificates, qualities, achievements, projects,
  volunteering, awards, publications, references and hobbies, plus as many custom sections as
  you want, as lists or as free text.
- **A gentle start.** On an empty CV, choose how you start (student or first job, experienced,
  career change) and the sections are ordered and opened for you. Or open a full example CV
  first.
- **Help while you write:** examples in every empty box and short tips under the fields that
  matter most, such as how to write a strong bullet point.
- **Personal details** with a photo, links, and the optional fields often asked for in Spain
  (availability, own vehicle, work permit, ID number, driving licence…), shown only when you
  add them.
- **Anonymous CV:** one switch hides your name, photo and personal details from the PDF for
  blind recruitment, without deleting them.
- **Rich descriptions** with bullets, bold and links; spell checking in the CV's language.
- **Quick editing:** drag sections and entries (mouse, touch or keyboard), duplicate an entry,
  sort entries by date, paste a whole list of skills at once, hide a section or an entry
  without deleting it, rename any section.
- **Undo instead of "are you sure?":** anything you remove can be brought back.
- **Closing touches:** a signature, drawn or uploaded, and a page footer for the data
  protection clause.

### Design
- **A new template system** (being built): three layouts (one column, titles in a margin
  column, sidebar), a full design customizer and ready-made looks. The first looks are
  available now, next to the original designs they will replace.
- **Design tools:** 15 open-licence fonts, size, line height and spacing, eight colours chosen
  for CVs or any custom colour, and the date format.
- **The CV's language:** section titles, dates and fixed texts in Spanish or British English,
  per CV.
- **Nothing gets cut:** long entries continue on the next page, long email addresses and links
  are split to fit, page numbers appear from page 2.
- **Live preview** that redraws as you type, with a full-screen mode, zoom and a resizable
  split between form and preview.

### Your data
- **Several CVs** side by side (one per job offer), each with its own history of earlier
  versions you can restore.
- **Saved automatically** in your browser; **export and import** a CV as a file, photo
  included, to continue on another computer.
- **Public computer mode:** nothing is kept after you finish, and one button erases everything.

## Roadmap

- Finish the template system: the sidebar layout, the full design customizer and sixteen
  ready-made looks.
- Fit to one page, black-and-white printing, photo crop, US Letter paper.
- A mobile layout.
- A home page, guides on writing a CV, and the legal pages.
- The whole site in British English.
- Later: a cover letter with the same design as the CV, and more languages.

## Tech stack

- **React 19 + Vite**, in plain JavaScript.
- **@react-pdf/renderer** builds the PDF in a Web Worker; **pdfjs-dist** draws the preview.
- **@dnd-kit** for drag and drop with mouse, touch and keyboard.
- **Fontsource** packages for the open-licence fonts.
- **Plain CSS** with design tokens (`src/index.css`); no UI framework, no animation library.

## Running it locally

```
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

## Project structure

```
src/
  App.jsx               the open CV's state; joins the form, the preview and the toolbar
  index.css, App.css    design tokens and styles; kit.css holds the shared buttons and fields
  components/           top bar, toolbar and its menus, preview, dialogs, icons
    form/               form sections, list sections, rich text editor, date picker, signature
  data/                 CV shape, section fields, design options, saving and import/export
  templates/            everything that becomes PDF
    engine/             the new template engine: layouts, shared parts, measuring
    looks.js            the ready-made looks (data, not code)
    designs/            the original designs, to be replaced by looks
    format.js           shared formatting: dates, sections in order, contact details
  locales/              every visible text (es.js, en-GB.js) and the example CV
```

A look is only data: a layout plus the customizer values that differ from the defaults, with
its own colour and font. Adding one means a few lines in `src/templates/looks.js` and its name
in the locale file.

## Licence

© 2026 Marcos Domínguez Galán. All rights reserved.

This code is public so others can see my work. You may read it, but you may not copy, modify,
distribute or reuse it, in whole or in part, without my written permission. The open-source
libraries and open-licence fonts it uses keep their own licences. See [LICENSE](LICENSE).
