import React, { useState } from "react";
import ContentBlock from "@/components/shared/pageBuilder/ContentBlock";
import BlockToolbar from "@/components/shared/pageBuilder/BlockToolbar";
import { useUploadMutation } from "@/services/upload/uploadApi";

const PageBuilder = ({ initialValue = "", onChange }) => {
  // Parse initial HTML content into blocks
  const [blocks, setBlocks] = useState(() => {
    if (initialValue) {
      // For now, we'll treat the entire content as a single CKEditor block
      // In a more advanced implementation, we could parse HTML into different block types
      return [
        {
          id: Date.now(),
          type: "ckeditor",
          content: initialValue,
          uniqueId: `block-${Date.now()}` // Add unique ID for each block
        }
      ];
    }
    return [];
  });
  
  // State for showing the content editor
  const [showEditor, setShowEditor] = useState(false);

  const [upload] = useUploadMutation();

  // Add a new block
  const addBlock = (type, index = blocks.length) => {
    const newBlock = {
      id: Date.now(),
      type,
      uniqueId: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each block
      content: type === "title" ? { text: "", icon: null } :
               type === "ckeditor" ? "" : 
               type === "image" ? { images: [], caption: "" } :
               type === "list" ? { listTitle: "", items: [{ text: "", icon: null, style: "default", color: "default" }] } : // Initialize with one empty item
               type === "table" ? { title: "", rows: [[]], columns: ["ستون 1"] } :
               type === "blockquote" ? { text: "", title: "", author: "", color: "indigo" } :
               type === "video" ? { url: "", title: "", thumbnail: "", isUploaded: false, isThumbnailUploaded: false } :
               type === "podcast" ? { url: "", title: "", isUploaded: false } :
               type === "link" ? { links: [{ id: Date.now(), image: null, title: "", description: "", url: "", color: "indigo" }] } : ""
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  };

  // Update a block
  const updateBlock = (id, content) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  };

  // Remove a block
  const removeBlock = (id) => {
    const blockToRemove = blocks.find(block => block.id === id);
    
    // If this is an uploaded video or podcast, we should delete it from Cloudinary
    if (blockToRemove && (blockToRemove.type === "video" || blockToRemove.type === "podcast")) {
      if (blockToRemove.content.isUploaded && blockToRemove.content.url) {
        deleteMedia(blockToRemove.content.url);
      }
      // Delete thumbnail if it exists and was uploaded
      if (blockToRemove.type === "video" && blockToRemove.content.isThumbnailUploaded && blockToRemove.content.thumbnail) {
        deleteMedia(blockToRemove.content.thumbnail);
      }
    }
    
    // If this is an image block, delete all images from Cloudinary
    if (blockToRemove && blockToRemove.type === "image") {
      if (blockToRemove.content.images && Array.isArray(blockToRemove.content.images)) {
        blockToRemove.content.images.forEach(image => {
          if (image.isUploaded && image.url) {
            deleteMedia(image.url);
          }
        });
      }
    }
    
    // If this is a link block, delete all images from Cloudinary
    if (blockToRemove && blockToRemove.type === "link") {
      if (blockToRemove.content.links && Array.isArray(blockToRemove.content.links)) {
        blockToRemove.content.links.forEach(link => {
          if (link.image && link.image.isUploaded && link.image.url) {
            deleteMedia(link.image.url);
          }
        });
      }
    }
    
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  };

  // Move a block up
  const moveBlockUp = (id) => {
    const index = blocks.findIndex(block => block.id === id);
    if (index <= 0) return;

    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  };

  // Move a block down
  const moveBlockDown = (id) => {
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1 || index >= blocks.length - 1) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
    onChange(serializeBlocks(newBlocks));
  };

  // Upload an image/video/podcast
  const uploadMedia = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await upload(formData).unwrap();
      return result.data.url; // Assuming the API returns the URL in result.data.url
    } catch (error) {
      console.error("Media upload failed:", error);
      throw error;
    }
  };

  // Delete media from Cloudinary
  const deleteMedia = async (mediaUrl) => {
    // In a real implementation, you would call an API to delete the media
    // For now, we'll just log it
    console.log("Deleting media:", mediaUrl);
  };

  const renderIconMarkup = (icon, className = "inline-block w-5 h-5") => {
    if (!icon) return "";

    if (icon.svg) {
      const colorStyle = icon.color ? ` style="color: ${icon.color}"` : "";
      return `<span class="${className} page-builder-icon"${colorStyle}>${icon.svg}</span>`;
    }

    if (icon.symbol) {
      return `<span class="${className}">${icon.symbol}</span>`;
    }

    return "";
  };

  // Serialize blocks to HTML with unique IDs
  const serializeBlocks = (blocksToSerialize) => {
    return blocksToSerialize.map(block => {
      // Add unique ID as a data attribute to each block
      const uniqueIdAttr = `data-block-id="${block.uniqueId}"`;
      
      if (block.type === "title") {
        // Handle title block with icon using Tailwind classes
        // Responsive text sizing: smaller on mobile, larger on desktop
        // Remove bold styling on mobile
        const titleIcon = renderIconMarkup(block.content.icon);
        if (titleIcon && block.content.text) {
          return `<h2 class="flex items-center gap-2 text-lg md:text-2xl font-normal text-gray-900 dark:text-white mt-6" ${uniqueIdAttr}>${titleIcon} ${block.content.text}</h2>`;
        } else if (block.content.text) {
          return `<h2 class="text-lg md:text-2xl font-normal text-gray-900 dark:text-white mt-4" ${uniqueIdAttr}>${block.content.text}</h2>`;
        }
        return "";
      } else if (block.type === "ckeditor") {
        // Make CKEditor content smaller on mobile and remove bold styling
        return `<div class="text-sm md:text-base font-normal mt-2" ${uniqueIdAttr}>${block.content}</div>`;
      } else if (block.type === "image") {
        // Handle multiple images with responsive grid layout using Tailwind classes
        // Single column on mobile, two columns on desktop
        // With glassmorphism effect for captions
        const imagesHtml = block.content.images.map(img => {
          // If image has a caption, create overlay with glassmorphism effect
          if (img.caption) {
            return `
              <div class="relative" ${uniqueIdAttr}>
                <div class="flex justify-center">
                  <img src="${img.url}" alt="${img.alt}" class="max-w-full h-auto rounded-lg my-2" />
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-b-lg p-1">
                  <p class="!text-white text-center text-xs md:text-sm">${img.caption}</p>
                </div>
              </div>
            `;
          } else {
            // If no caption, just show the image normally
            return `
              <div class="flex justify-center" ${uniqueIdAttr}>
                <img src="${img.url}" alt="${img.alt}" class="max-w-full h-auto rounded-lg my-2" />
              </div>
            `;
          }
        }).join("");
        
        return `
          <div class="my-4" ${uniqueIdAttr}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${imagesHtml}
            </div>
            ${block.content.caption ? `<p class="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base">${block.content.caption}</p>` : ""}
          </div>
        `;
      } else if (block.type === "list") {
        // Handle the new list structure with icons using Tailwind classes
        // Remove bold styling on mobile
        // Fix icon vertical alignment for multi-line text
        // Add support for individual list item styles
        const baseStyleOptions = [
          { value: "default", class: "flex items-center gap-1 p-1 md:p-2 w-fit h-fit" },
          { value: "blue", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" },
          { value: "red", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" },
          { value: "green", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" },
          { value: "indigo", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" },
          { value: "purple", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" },
          { value: "yellow", class: "flex items-center gap-1 p-1 md:p-2 dark:bg-gray-800 dark:border-gray-700 border-gray-100 w-fit h-fit" }
        ];
        
        // Define color options for list items
        const colorOptions = {
          indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100' },
          blue: { bg: 'bg-blue-50', border: 'border-blue-100' },
          green: { bg: 'bg-green-50', border: 'border-green-100' },
          red: { bg: 'bg-red-50', border: 'border-red-100' },
          purple: { bg: 'bg-purple-50', border: 'border-purple-100' },
          yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100' }
        };
        
        let html = "";
        if (block.content.listTitle) {
          html += `<h3 class="text-base md:text-lg font-normal text-gray-800 dark:text-white my-2" ${uniqueIdAttr}>${block.content.listTitle}</h3>`;
        }
        
        const items = block.content.items.map(item => {
          // Get the base style class for this specific item
          const baseStyle = baseStyleOptions.find(style => style.value === (item.style || "default")) || baseStyleOptions[0];
          
          // Get the color for this specific item
          const itemColor = item.color ? colorOptions[item.color] : null;
          
          // Combine base style with color classes
          const itemClass = itemColor
            ? `${baseStyle.class} ${itemColor.bg} border ${itemColor.border} rounded-xl shadow-sm hover:shadow-md transition-shadow`
            : baseStyle.class;
          
          const itemIcon = renderIconMarkup(item.icon, "flex-shrink-0 w-4 h-4 ltr:mr-2 rtl:ml-2 page-builder-icon");
          if (itemIcon) {
            // Include icon in the list item using Tailwind classes
            // Use flexbox to vertically center icon with multi-line text
            return `<li class="${itemClass} mb-1 flex text-sm md:text-base font-normal" ${uniqueIdAttr}>
              ${itemIcon}
              <span>${item.text}</span>
            </li>`;
          }
          return `<li class="${itemClass} mb-1 text-sm md:text-base font-normal" ${uniqueIdAttr}>${item.text}</li>`;
        }).join("");
        
        return `<ul class="mt-2 mb-4 space-y-1" ${uniqueIdAttr}>${items}</ul>`;
      } else if (block.type === "table") {
        // Handle table block with Tailwind classes
        // Remove bold styling on mobile
        // Modified to use w-fit, center alignment, proper borders, and horizontal scrolling
        let html = `<div class="my-4 flex justify-center overflow-x-auto" ${uniqueIdAttr}><table class="w-fit bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-xs md:text-sm">`;
        
        // Add header row with title if exists
        if (block.content.columns && block.content.columns.length > 0) {
          html += '<thead class="bg-gray-50 dark:bg-gray-700 text-xs"><tr>';
          
          // If table has a title, add it as the first header cell that spans all columns
          if (block.content.title) {
            html += `<th class="px-4 py-3 text-center font-normal text-gray-900 dark:text-white text-sm md:text-base border border-gray-200 dark:border-gray-600" colspan="${block.content.columns.length}">${block.content.title}</th>`;
            html += '</tr><tr>'; // Start a new row for column headers
          }
          
          // Add column headers with borders
          block.content.columns.forEach(col => {
            html += `<th class="px-4 py-3 text-center font-normal text-gray-900 dark:text-white text-xs md:text-sm border border-gray-200 dark:border-gray-600">${col}</th>`;
          });
          html += '</tr></thead>';
        }
        
        // Add body rows with borders
        if (block.content.rows && block.content.rows.length > 0) {
          html += '<tbody>';
          block.content.rows.forEach(row => {
            html += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">';
            row.forEach(cell => {
              html += `<td class="px-4 py-3 text-center text-gray-900 dark:text-white text-xs md:text-sm font-normal border border-gray-200 dark:border-gray-600">${cell}</td>`;
            });
            html += '</tr>';
          });
          html += '</tbody>';
        }
        
        html += '</table></div>';
        return html;
      } else if (block.type === "blockquote") {
        // Handle blockquote with color options and responsive width
        if (block.content.text) {
          // Define color options with lighter intensity
          const colorOptions = [
            { value: "indigo", classes: "from-indigo-50 to-indigo-50 border-indigo-100 text-indigo-800" },
            { value: "green", classes: "from-green-50 to-green-50 border-green-100 text-green-800" },
            { value: "blue", classes: "from-blue-50 to-blue-50 border-blue-100 text-blue-800" },
            { value: "purple", classes: "from-purple-50 to-purple-50 border-purple-100 text-purple-800" },
            { value: "red", classes: "from-red-50 to-red-50 border-red-100 text-red-800" },
            { value: "yellow", classes: "from-yellow-50 to-yellow-50 border-yellow-100 text-yellow-800" }
          ];
          
          // Get the current color classes or default to indigo
          const currentColor = block.content.color || "indigo";
          const selectedColor = colorOptions.find(option => option.value === currentColor) || colorOptions[0];
          
          const titleHtml = block.content.title ? `<h3 class="text-2xl font-bold ${selectedColor.classes.split(" ")[3]} mb-4">${block.content.title}</h3>` : '';
          const authorHtml = block.content.author ? `<footer class="mt-4 text-right font-medium ${selectedColor.classes.split(" ")[3]}">— ${block.content.author}</footer>` : '';
          
          // Use different classes for RTL and LTR support
          // RTL: border-r, gradient from right to left
          // LTR: border-l, gradient from left to right
          return `
            <div class="bg-gradient-to-l ${selectedColor.classes.split(" ")[0]} ${selectedColor.classes.split(" ")[1]} p-6 rounded-xl ltr:bg-gradient-to-r ltr:border-l-4 ltr:border-r-0 border-r-4 ${selectedColor.classes.split(" ")[2]} w-full md:w-1/2 mt-2" ${uniqueIdAttr}>
              ${titleHtml}
              <p class="text-base italic">${block.content.text}</p>
              ${authorHtml}
            </div>
          `;
        }
        return "";
      } else if (block.type === "link") {
        // Handle link block with multiple links
        if (block.content.links && block.content.links.length > 0) {
          // Define color options
          const colorOptions = {
            indigo: { from: 'from-indigo-50', to: 'to-indigo-100', text: 'text-indigo-800' },
            blue: { from: 'from-blue-50', to: 'to-blue-100', text: 'text-blue-800' },
            green: { from: 'from-green-50', to: 'to-green-100', text: 'text-green-800' },
            red: { from: 'from-red-50', to: 'to-red-100', text: 'text-red-800' },
            purple: { from: 'from-purple-50', to: 'to-purple-100', text: 'text-purple-800' },
            yellow: { from: 'from-yellow-50', to: 'to-yellow-100', text: 'text-yellow-800' }
          };
          
          const linksHtml = block.content.links.map(link => {
            if (link.image && link.title && link.url) {
              // Get the selected color or default to indigo
              const selectedColor = colorOptions[link.color] || colorOptions.indigo;
              
              return `
                <div class="bg-gradient-to-br ${selectedColor.from} ${selectedColor.to} p-4 rounded-xl flex-shrink-0" style="width: 300px;">
                  <a aria-label="${link.title}" href="${link.url}">
                    <div class="flex items-center gap-3">
                      <div class="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          alt="${link.image.alt || link.title}"
                          loading="lazy"
                          decoding="async"
                          data-nimg="fill"
                          class="object-cover"
                          style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
                          src="${link.image.url}"
                        />
                      </div>
                      <div class="flex-1 text-right">
                        <h4 class="text-base font-bold ${selectedColor.text} mb-1 dark:text-gray-900">${link.title}</h4>
                        ${link.description ? `<p class="text-xs text-gray-700 line-clamp-2 dark:text-gray-900">${link.description}</p>` : ''}
                      </div>
                    </div>
                  </a>
                </div>
              `;
            }
            return '';
          }).join('');
          
          return `
            <div class="mt-2" ${uniqueIdAttr}>
              <div class="overflow-x-auto scrollbar-hide">
                <div class="flex gap-4 pb-2" style="width: max-content; min-width: 100%;">
                  ${linksHtml}
                </div>
              </div>
            </div>
          `;
        }
        return "";
      } else if (block.type === "video") {
        // Handle video embedding with thumbnail
        if (block.content.url) {
          // If thumbnail exists, show it with play button overlay
          if (block.content.thumbnail) {
            return `
              <div class="my-4 mt-2" ${uniqueIdAttr}>
                <div class="relative">
                  <img src="${block.content.thumbnail}" alt="${block.content.title || 'Video thumbnail'}" class="w-full rounded-lg" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <a href="${block.content.url}" target="_blank" class="bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition">
                      <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
                ${block.content.title ? `<p class="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base">${block.content.title}</p>` : ""}
              </div>
            `;
          } else {
            // Show embedded video player
            return `
              <div class="my-4 mt-2" ${uniqueIdAttr}>
                <div class="relative pb-[56.25%] h-0"> <!-- 16:9 Aspect Ratio -->
                  <iframe 
                    src="${block.content.url}" 
                    class="absolute top-0 left-0 w-full h-full rounded-lg" 
                    frameborder="0" 
                    allowfullscreen
                    title="${block.content.title || 'Embedded Video'}"
                  ></iframe>
                </div>
                ${block.content.title ? `<p class="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base">${block.content.title}</p>` : ""}
              </div>
            `;
          }
        }
        return "";
      } else if (block.type === "podcast") {
        // Handle podcast embedding
        if (block.content.url) {
          return `
            <div class="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg" ${uniqueIdAttr}>
              <audio controls class="w-full">
                <source src="${block.content.url}" type="audio/mpeg">
                مرورگر شما از پخش پادکست پشتیبانی نمی‌کند.
              </audio>
              ${block.content.title ? `<p class="text-center text-gray-700 dark:text-gray-300 mt-2 text-sm md:text-base">${block.content.title}</p>` : ""}
            </div>
          `;
        }
        return "";
      }
      return "";
    }).join("");
  };

  return (
    <div className="page-builder">
      {!showEditor ? (
        <div 
          className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 bg-white transition-colors hover:border-zinc-500 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-600"
          onClick={() => setShowEditor(true)}
        >
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100">افزودن محتوا</p>
        </div>
      ) : (
        // Full-screen modal overlay
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950">
          <div className="flex flex-col h-screen">
            {/* Header with close button */}
            <div className="flex justify-between items-center border-b border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">ویرایشگر محتوا</h2>
              <button 
                className="rounded border border-zinc-300 bg-white px-4 py-2 text-zinc-800 transition hover:border-zinc-700 dark:border-zinc-700 dark:bg-black dark:text-zinc-100 dark:hover:border-white"
                onClick={() => setShowEditor(false)}
              >
                بستن
              </button>
            </div>
            
            {/* Main content area - full screen */}
            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
              {/* Editor Panel - Full width on mobile, half on desktop */}
              <div className="lg:w-1/2 w-full flex flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                  <BlockToolbar onAddBlock={addBlock} />
                </div>
                
                <div className="flex-grow overflow-y-auto p-4">
                  <div className="blocks-container">
                    {blocks.map((block, index) => (
                      <ContentBlock
                        key={block.id}
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        onUpdate={updateBlock}
                        onRemove={removeBlock}
                        onMoveUp={moveBlockUp}
                        onMoveDown={moveBlockDown}
                        onUploadImage={uploadMedia}
                        onDeleteImage={deleteMedia}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Preview Panel - Full width on mobile, half on desktop */}
              <div className="lg:w-1/2 w-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white">پیش‌نمایش محتوا</h3>
                </div>
                
                <div className="flex-grow overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div className="preview-content" dangerouslySetInnerHTML={{ __html: serializeBlocks(blocks) }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilder;

