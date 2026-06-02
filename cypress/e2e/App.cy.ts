describe("WeLC", () => {
  it("displays a filepicker", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-test='fileInput']").should("exist");
  });

  it("allows the user to select a file and displays/plays the result", () => {
    cy.visit("http://localhost:5173/");
    // Before you select a file, the audio element and playlist should not exist
    cy.get("[data-test='audio']").should("not.exist");
    cy.get("[data-test='playlist']").should("not.exist");

    cy.get("[data-test='fileInput']").selectFile("cypress/fixtures/audio1.mp3");
    cy.wait(1000);

    // Now audio should play and the filename/metadata should appear
    cy.get("[data-test='audio']")
      .should("exist")
      .should("have.prop", "paused")
      .then((paused) => expect(paused).to.be.false);
    cy.get("[data-test='playlist']>li").contains("audio1.mp3");
    const expectedMetadata = [
      "Title: Track 1",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 1",
    ];
    cy.get("[data-test='metadata']>li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  });

  it("allows the user to select multiple files and click on one to play it", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-test='fileInput']").selectFile([
      "cypress/fixtures/audio1.mp3",
      "cypress/fixtures/audio2.mp3",
      "cypress/fixtures/audio3.mp3",
    ]);
    cy.wait(500);

    const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
    cy.get("[data-test='playlist']>li").then((elements) => {
      const actualPlaylist = [...elements].map((li) => li.innerText.trim());
      expect(actualPlaylist).to.deep.equal(expectedPlaylist);
    });
    cy.get("[data-test='playlist']>li").contains("audio3.mp3").click();
    cy.wait(1000);

    // Track 3 should play and tracks 1 and 2 should not appear anymore
    const newPlaylist = ["audio3.mp3"];
    cy.get("[data-test='playlist']>li").then((elements) => {
      const actualPlaylist = [...elements].map((li) => li.innerText.trim());
      expect(actualPlaylist).to.deep.equal(newPlaylist);
    });
    const expectedMetadata = [
      "Title: Track 3",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 3",
    ];
    cy.get("[data-test='metadata']>li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  });

  it("plays the next track after the first track is finished", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-test='fileInput']").selectFile([
      "cypress/fixtures/audio1.mp3",
      "cypress/fixtures/audio2.mp3",
      "cypress/fixtures/audio3.mp3",
    ]);
    cy.get("[data-test='audio']").then((audioEl) => {
      const audio = audioEl[0] as HTMLAudioElement;
      audio.currentTime = 166; // audio1.mp3 is 2:47s
      cy.wait(5000);
    });

    const newPlaylist = ["audio2.mp3", "audio3.mp3"];
    cy.get("[data-test='playlist']>li").then((elements) => {
      const actualPlaylist = [...elements].map((li) => li.innerText.trim());
      expect(actualPlaylist).to.deep.equal(newPlaylist);
    });
    const expectedMetadata = [
      "Title: Track 2",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 2",
    ];
    cy.get("[data-test='metadata']>li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  })

  it("resets the app when the end of the last file is reached", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-test='fileInput']").selectFile("cypress/fixtures/audio1.mp3");

    // after playing to the end of the file, the audio element should disappear
    // and the metadata and playlist should clear
    const audioEl = cy.get("[data-test='audio']")
    audioEl.then((audioEl) => {
      const audio = audioEl[0] as HTMLAudioElement;
      audio.currentTime = 166; // audio1.mp3 is 2:47s
      cy.wait(2000);
    });

    audioEl.should('not.exist');
    cy.get("[data-test='metadata']>li").should('have.length', 0);
    cy.get("[data-test='playlist']").should('not.exist');
  })
});
