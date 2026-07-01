import { ChevronLeft, ChevronRight, RotateCcw, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ImageGroup, ScanResponse, Vote } from "../shared/types";

type SessionGroup = ImageGroup & {
  shuffledImages: ImageGroup["images"];
};

type AppState = "setup" | "voting" | "results";
type VotingMode = "single" | "multi";
type Language = "en" | "de";

type LightboxState = {
  groupId: string;
  imageId: string;
};

type TranslationKey =
  | "appTitle"
  | "groupProgress"
  | "setupTitle"
  | "setupCopy"
  | "votingMode"
  | "singlevote"
  | "multivote"
  | "folderPlaceholder"
  | "loading"
  | "scan"
  | "loadFolderError"
  | "unknownError"
  | "votingQuestion"
  | "selectedCount"
  | "openImageHint"
  | "chooseImage"
  | "removeSelection"
  | "saveSelection"
  | "skip"
  | "resultsEyebrow"
  | "resultsTitle"
  | "restart"
  | "votableGroups"
  | "votesCast"
  | "skipped"
  | "ignoredFiles"
  | "skippedGroups"
  | "noCategories"
  | "votes"
  | "visualResultsEyebrow"
  | "visualResultsTitle"
  | "selected"
  | "missingImage"
  | "enlargedImage"
  | "closeImage"
  | "previousImage"
  | "nextImage"
  | "enlargedVariant";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appTitle: "Variant Vote",
    groupProgress: "Group {current} of {total}",
    setupTitle: "Load Folder",
    setupCopy: "Enter the local path to the folder whose images you want to compare.",
    votingMode: "Voting mode",
    singlevote: "Singlevote",
    multivote: "Multivote",
    folderPlaceholder: "e.g. G:\\Images\\Comparison",
    loading: "Loading...",
    scan: "Scan",
    loadFolderError: "The folder could not be loaded.",
    unknownError: "Unknown error.",
    votingQuestion: "Which variant do you like best?",
    selectedCount: "{count} selected",
    openImageHint: "Click image to enlarge",
    chooseImage: "Choose this image",
    removeSelection: "Remove selection",
    saveSelection: "Save selection",
    skip: "Skip",
    resultsEyebrow: "Evaluation",
    resultsTitle: "Results",
    restart: "Restart",
    votableGroups: "votable groups",
    votesCast: "votes cast",
    skipped: "skipped",
    ignoredFiles: "ignored files",
    skippedGroups: "skipped groups",
    noCategories: "No image categories found.",
    votes: "votes",
    visualResultsEyebrow: "Individual Results",
    visualResultsTitle: "Selected Images per Group",
    selected: "Selected",
    missingImage: "No image",
    enlargedImage: "Enlarged image",
    closeImage: "Close image",
    previousImage: "Previous image",
    nextImage: "Next image",
    enlargedVariant: "Enlarged variant"
  },
  de: {
    appTitle: "Variant Vote",
    groupProgress: "Gruppe {current} von {total}",
    setupTitle: "Ordner laden",
    setupCopy: "Gib den lokalen Pfad zu dem Ordner ein, dessen Bilder verglichen werden sollen.",
    votingMode: "Votingmodus",
    singlevote: "Singlevote",
    multivote: "Multivote",
    folderPlaceholder: "z. B. G:\\Bilder\\Vergleich",
    loading: "Lade...",
    scan: "Scannen",
    loadFolderError: "Der Ordner konnte nicht geladen werden.",
    unknownError: "Unbekannter Fehler.",
    votingQuestion: "Welche Variante gefaellt dir am besten?",
    selectedCount: "{count} ausgewaehlt",
    openImageHint: "Bild anklicken zum Vergroessern",
    chooseImage: "Dieses Bild waehlen",
    removeSelection: "Auswahl entfernen",
    saveSelection: "Auswahl speichern",
    skip: "Skip",
    resultsEyebrow: "Auswertung",
    resultsTitle: "Ergebnis",
    restart: "Neu starten",
    votableGroups: "bewertbare Gruppen",
    votesCast: "abgegebene Stimmen",
    skipped: "geskippt",
    ignoredFiles: "ignorierte Dateien",
    skippedGroups: "uebersprungene Gruppen",
    noCategories: "Keine Bildkategorien gefunden.",
    votes: "Stimmen",
    visualResultsEyebrow: "Einzelwertung",
    visualResultsTitle: "Gewaehlte Bilder pro Gruppe",
    selected: "Gewaehlt",
    missingImage: "Kein Bild",
    enlargedImage: "Vergroessertes Bild",
    closeImage: "Bild schliessen",
    previousImage: "Vorheriges Bild",
    nextImage: "Naechstes Bild",
    enlargedVariant: "Vergroesserte Variante"
  }
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function variantLabel(index: number): string {
  return `Variant ${String.fromCharCode(65 + index)}`;
}

function formatTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
}

export function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [folderPath, setFolderPath] = useState("");
  const [votingMode, setVotingMode] = useState<VotingMode>("single");
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [skippedGroupIds, setSkippedGroupIds] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [state, setState] = useState<AppState>("setup");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const text = translations[language];
  const locale = language === "de" ? "de-DE" : "en-US";
  const currentGroup = groups[currentIndex];

  const openLightbox = (groupId: string, imageId: string) => {
    setLightbox({ groupId, imageId });
  };

  const advanceGroup = useCallback(() => {
    setLightbox(null);
    setSelectedImageIds([]);

    if (currentIndex + 1 >= groups.length) {
      setState("results");
    } else {
      setCurrentIndex((index) => index + 1);
    }
  }, [currentIndex, groups.length]);

  const startScan = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? text.loadFolderError);
      }

      const sessionGroups = data.groups.map((group: ImageGroup) => ({
        ...group,
        shuffledImages: shuffle(group.images)
      }));

      setScan(data);
      setGroups(sessionGroups);
      setVotes([]);
      setSkippedGroupIds([]);
      setSelectedImageIds([]);
      setCurrentIndex(0);
      setLightbox(null);
      setState(sessionGroups.length > 0 ? "voting" : "results");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : text.unknownError);
    } finally {
      setIsLoading(false);
    }
  };

  const votesForImages = useCallback(
    (imageIds: string[]) => {
      if (!currentGroup || imageIds.length === 0) {
        return [];
      }

      return imageIds
        .map((imageId) => currentGroup.shuffledImages.find((image) => image.id === imageId))
        .filter((image): image is ImageGroup["images"][number] => Boolean(image))
        .map((image) => ({
          groupId: currentGroup.id,
          imageId: image.id,
          category: image.category
        }));
    },
    [currentGroup]
  );

  const voteForImage = useCallback(
    (imageId: string) => {
      if (votingMode === "multi") {
        setSelectedImageIds((selectedIds) =>
          selectedIds.includes(imageId) ? selectedIds.filter((id) => id !== imageId) : [...selectedIds, imageId]
        );
        return;
      }

      const nextVotes = votesForImages([imageId]);
      if (nextVotes.length === 0) {
        return;
      }

      setVotes((existingVotes) => [...existingVotes, ...nextVotes]);
      advanceGroup();
    },
    [advanceGroup, votesForImages, votingMode]
  );

  const saveMultiVote = () => {
    const nextVotes = votesForImages(selectedImageIds);
    if (nextVotes.length === 0) {
      return;
    }

    setVotes((existingVotes) => [...existingVotes, ...nextVotes]);
    advanceGroup();
  };

  const skipCurrentGroup = () => {
    if (currentGroup) {
      setSkippedGroupIds((groupIds) => [...groupIds, currentGroup.id]);
    }
    advanceGroup();
  };

  const lightboxGroup = useMemo(
    () => (lightbox ? groups.find((group) => group.id === lightbox.groupId) : undefined),
    [groups, lightbox]
  );
  const lightboxImages = lightboxGroup?.shuffledImages ?? [];
  const enlargedImage = lightboxImages.find((image) => image.id === lightbox?.imageId) ?? null;
  const canVoteFromLightbox = state === "voting" && currentGroup?.id === lightboxGroup?.id && !!enlargedImage;

  const moveLightbox = useCallback(
    (direction: -1 | 1) => {
      if (!lightbox || lightboxImages.length === 0) {
        return;
      }

      const currentImageIndex = lightboxImages.findIndex((image) => image.id === lightbox.imageId);
      const nextIndex = (currentImageIndex + direction + lightboxImages.length) % lightboxImages.length;
      setLightbox({ groupId: lightbox.groupId, imageId: lightboxImages[nextIndex].id });
    },
    [lightbox, lightboxImages]
  );

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      }
      if (event.key === "ArrowLeft") {
        moveLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        moveLightbox(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, moveLightbox]);

  const results = useMemo(() => {
    const counts = new Map<string, number>();
    for (const vote of votes) {
      counts.set(vote.category, (counts.get(vote.category) ?? 0) + 1);
    }

    return (scan?.stats.categories ?? [])
      .map((category) => {
        const count = counts.get(category) ?? 0;

        return {
          category,
          count,
          percentage: votes.length > 0 ? (count / votes.length) * 100 : 0
        };
      })
      .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));
  }, [scan?.stats.categories, votes]);

  const highestVoteCount = results[0]?.count ?? 0;
  const hasWinner = votes.length > 0 && highestVoteCount > 0;
  const votesByGroup = useMemo(() => {
    const groupedVotes = new Map<string, Vote[]>();
    for (const vote of votes) {
      groupedVotes.set(vote.groupId, [...(groupedVotes.get(vote.groupId) ?? []), vote]);
    }
    return groupedVotes;
  }, [votes]);
  const orderedCategories = scan?.stats.categories ?? [];
  const currentGroupCaptions = currentGroup?.shuffledImages.map((image) => image.caption?.trim()).filter(Boolean) ?? [];
  const sharedCurrentGroupCaption =
    currentGroupCaptions.length === currentGroup?.shuffledImages.length &&
    currentGroupCaptions.every((caption) => caption === currentGroupCaptions[0])
      ? currentGroupCaptions[0]
      : undefined;

  const reset = () => {
    setState("setup");
    setScan(null);
    setGroups([]);
    setVotes([]);
    setSkippedGroupIds([]);
    setSelectedImageIds([]);
    setCurrentIndex(0);
    setError("");
    setLightbox(null);
  };

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <h1>{text.appTitle}</h1>
        </div>
        <div className="top-actions">
          <div className="language-toggle" aria-label="Language">
            <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>
              EN
            </button>
            <button type="button" className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>
              DE
            </button>
          </div>
          {state === "voting" && (
            <div className="progress-pill">
              {formatTemplate(text.groupProgress, { current: currentIndex + 1, total: groups.length })}
            </div>
          )}
        </div>
      </header>

      {state === "setup" && (
        <section className="setup-panel">
          <div className="setup-copy">
            <h2>{text.setupTitle}</h2>
            <p>{text.setupCopy}</p>
          </div>
          <div className="mode-toggle" aria-label={text.votingMode}>
            <button type="button" className={votingMode === "single" ? "active" : ""} onClick={() => setVotingMode("single")}>
              {text.singlevote}
            </button>
            <button type="button" className={votingMode === "multi" ? "active" : ""} onClick={() => setVotingMode("multi")}>
              {text.multivote}
            </button>
          </div>
          <div className="path-row">
            <input
              autoFocus
              value={folderPath}
              onChange={(event) => setFolderPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void startScan();
                }
              }}
              placeholder={text.folderPlaceholder}
            />
            <button type="button" onClick={() => void startScan()} disabled={isLoading || !folderPath.trim()}>
              {isLoading ? text.loading : text.scan}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>
      )}

      {state === "voting" && currentGroup && (
        <section className="voting-panel">
          <div className="question-row">
            <h2>{text.votingQuestion}</h2>
            <p className="interaction-hint">
              {votingMode === "multi" ? formatTemplate(text.selectedCount, { count: selectedImageIds.length }) : text.openImageHint}
            </p>
          </div>

          <div className="image-grid" style={{ "--image-count": currentGroup.shuffledImages.length } as React.CSSProperties}>
            {currentGroup.shuffledImages.map((image, index) => {
              const isSelected = selectedImageIds.includes(image.id);

              return (
                <article className={`image-choice ${isSelected ? "selected" : ""}`} key={image.id}>
                  <div className="choice-label">{variantLabel(index)}</div>
                  <button type="button" className="image-button" onClick={() => openLightbox(currentGroup.id, image.id)}>
                    <img src={image.imageUrl} alt={variantLabel(index)} />
                  </button>
                  {!sharedCurrentGroupCaption && image.caption && <p className="image-caption">{image.caption}</p>}
                  <button type="button" className="select-button" onClick={() => voteForImage(image.id)}>
                    {votingMode === "multi" && isSelected ? text.removeSelection : text.chooseImage}
                  </button>
                </article>
              );
            })}
          </div>
          {sharedCurrentGroupCaption && <p className="shared-image-caption">{sharedCurrentGroupCaption}</p>}
          <div className="voting-actions">
            {votingMode === "multi" && (
              <button type="button" className="save-vote-button" onClick={saveMultiVote} disabled={selectedImageIds.length === 0}>
                {text.saveSelection}
              </button>
            )}
            <button type="button" className="skip-button" onClick={skipCurrentGroup}>
              {text.skip}
            </button>
          </div>
        </section>
      )}

      {state === "results" && (
        <section className="results-panel">
          <div className="results-header">
            <div>
              <p className="eyebrow">{text.resultsEyebrow}</p>
              <h2>{text.resultsTitle}</h2>
            </div>
            <button type="button" className="secondary-button" onClick={reset}>
              <RotateCcw size={18} />
              {text.restart}
            </button>
          </div>

          {scan && (
            <div className="stats-grid">
              <div>
                <span>{groups.length}</span>
                {text.votableGroups}
              </div>
              <div>
                <span>{votes.length}</span>
                {text.votesCast}
              </div>
              <div>
                <span>{skippedGroupIds.length}</span>
                {text.skipped}
              </div>
              <div>
                <span>{scan.stats.ignoredFiles}</span>
                {text.ignoredFiles}
              </div>
              <div>
                <span>{scan.stats.skippedSingleImageGroups}</span>
                {text.skippedGroups}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <p className="empty-state">{text.noCategories}</p>
          ) : (
            <div className="result-table">
              {results.map((result) => {
                const isWinner = hasWinner && result.count === highestVoteCount;

                return (
                  <div className={`result-row ${isWinner ? "winner" : ""}`} key={result.category}>
                    <div className="category-cell">
                      {isWinner && <Trophy size={18} />}
                      <strong>{result.category}</strong>
                    </div>
                    <div>
                      {result.count} {text.votes}
                    </div>
                    <div>{result.percentage.toLocaleString(locale, { maximumFractionDigits: 1 })} %</div>
                  </div>
                );
              })}
            </div>
          )}

          {(votes.length > 0 || skippedGroupIds.length > 0) && (
            <section className="visual-results">
              <div>
                <p className="eyebrow">{text.visualResultsEyebrow}</p>
                <h3>{text.visualResultsTitle}</h3>
              </div>
              <div className="visual-result-list">
                {groups.map((group) => {
                  const groupVotes = votesByGroup.get(group.id) ?? [];
                  const selectedVoteImageIds = new Set(groupVotes.map((vote) => vote.imageId));
                  const imagesByCategory = new Map(group.images.map((image) => [image.category, image]));

                  return (
                    <article className="visual-result-group" key={group.id}>
                      <div className="visual-result-header">
                        <strong>ID {group.id}</strong>
                        {groupVotes.length > 0 && (
                          <span>
                            {text.selected}: {groupVotes.map((vote) => vote.category).join(", ")}
                          </span>
                        )}
                        {groupVotes.length === 0 && skippedGroupIds.includes(group.id) && <span>{text.skip}</span>}
                      </div>
                      <div
                        className="thumbnail-grid"
                        style={{ "--category-count": orderedCategories.length } as React.CSSProperties}
                      >
                        {orderedCategories.map((category) => {
                          const image = imagesByCategory.get(category);
                          const wasSelected = image ? selectedVoteImageIds.has(image.id) : false;

                          if (!image) {
                            return (
                              <div className="thumbnail-choice missing" key={category}>
                                <span>{category}</span>
                                <div>{text.missingImage}</div>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              className={`thumbnail-choice ${wasSelected ? "selected" : ""}`}
                              key={image.id}
                              onClick={() => openLightbox(group.id, image.id)}
                            >
                              <span>{image.category}</span>
                              <img src={image.imageUrl} alt={image.category} />
                              {image.caption && <p>{image.caption}</p>}
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </section>
      )}

      {lightbox && enlargedImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={text.enlargedImage}>
          <button type="button" className="lightbox-backdrop" aria-label={text.closeImage} onClick={() => setLightbox(null)} />
          <div className="lightbox-content">
            <button type="button" className="lightbox-close" aria-label={text.closeImage} onClick={() => setLightbox(null)}>
              <X size={22} />
            </button>
            {lightboxImages.length > 1 && (
              <>
                <button type="button" className="lightbox-nav previous" aria-label={text.previousImage} onClick={() => moveLightbox(-1)}>
                  <ChevronLeft size={34} />
                </button>
                <button type="button" className="lightbox-nav next" aria-label={text.nextImage} onClick={() => moveLightbox(1)}>
                  <ChevronRight size={34} />
                </button>
              </>
            )}
            <img src={enlargedImage.imageUrl} alt={text.enlargedVariant} />
            {enlargedImage.caption && <p className="lightbox-caption">{enlargedImage.caption}</p>}
            {canVoteFromLightbox && (
              <button type="button" className="lightbox-vote" onClick={() => voteForImage(enlargedImage.id)}>
                {votingMode === "multi" && selectedImageIds.includes(enlargedImage.id) ? text.removeSelection : text.chooseImage}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
