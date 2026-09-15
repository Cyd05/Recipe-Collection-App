<template>
  <ion-page class="modern-asian-theme">

    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-nav-toolbar">
        <ion-title class="app-region-title">
          <span>🍴 Recipe Collection</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding app-body-content">

      <!-- WELCOME SECTION -->
      <div class="welcome-section">
        <h1>My Recipe Book 🍳</h1>
        <p>Save and manage your favorite recipes.</p>
      </div>

      <!-- ADD / EDIT RECIPE CARD FORM -->
      <div class="form-card-container">
        <div class="form-card-header">
          <h3>{{ editingRecipeId ? '✏️ Edit Recipe' : '➕ Add New Recipe' }}</h3>
        </div>

        <div class="form-card-body">
          <div class="custom-form-group">
            <label>Recipe Name</label>
            <ion-item lines="none" class="stylish-input-item">
              <ion-input placeholder="e.g. Chicken Adobo" v-model="recipeName"></ion-input>
            </ion-item>
          </div>

          <div class="custom-form-group">
            <label>Category</label>
            <ion-item lines="none" class="stylish-input-item">
              <ion-input placeholder="e.g. Main Dish, Dessert" v-model="category"></ion-input>
            </ion-item>
          </div>

          <div class="custom-form-group">
            <label>Ingredients</label>
            <ion-item lines="none" class="stylish-input-item">
              <ion-textarea :rows="3" placeholder="Enter ingredients..." v-model="ingredients"></ion-textarea>
            </ion-item>
          </div>

          <div class="custom-form-group">
            <label>Instructions</label>
            <ion-item lines="none" class="stylish-input-item">
              <ion-textarea :rows="4" placeholder="Enter cooking instructions..." v-model="instructions"></ion-textarea>
            </ion-item>
          </div>

          <div class="custom-form-group">
            <label>Preparation Time</label>
            <ion-item lines="none" class="stylish-input-item">
              <ion-input placeholder="e.g. 30 minutes" v-model="preparationTime"></ion-input>
            </ion-item>
          </div>

          <!-- SAVE / UPDATE BUTTON -->
          <ion-button 
            expand="block" 
            class="submit-form-btn" 
            @click="editingRecipeId ? updateRecipe() : saveRecipe()"
          >
            {{ editingRecipeId ? 'Update Recipe' : 'Save Recipe' }}
          </ion-button>

          <!-- CANCEL BUTTON -->
          <ion-button 
            v-if="editingRecipeId" 
            expand="block" 
            fill="outline" 
            class="cancel-form-btn" 
            @click="cancelEdit"
          >
            Cancel
          </ion-button>
        </div>
      </div>

      <!-- SAVED RECIPES TITLE -->
      <div class="recipes-title">
        <h2>🍽️ Saved Recipes</h2>
        <p>Your recipe collection</p>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="recipes.length === 0" class="empty-message">
        <div class="empty-bowl-icon">🍳</div>
        <h3>No recipes yet</h3>
        <p>Add your first recipe above!</p>
      </div>

      <!-- RECIPE LIST -->
      <div v-else class="recipe-cards-wrapper">
        <div 
          v-for="recipe in recipes" 
          :key="recipe.id" 
          class="dark-recipe-card"
        >
          <div class="card-header-row">
            <h3 class="recipe-name-text">🍲 {{ recipe.recipeName }}</h3>
            <span class="category-pill-badge">📂 {{ recipe.category || 'Uncategorized' }}</span>
          </div>

          <div class="recipe-info">
            <h4>🥕 Ingredients</h4>
            <p>{{ recipe.ingredients }}</p>

            <h4>👨‍🍳 Instructions</h4>
            <p class="formatted-instructions">{{ recipe.instructions }}</p>

            <h4>⏱️ Preparation Time</h4>
            <p>{{ recipe.preparationTime }}</p>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="action-buttons">
            <ion-button 
              size="small" 
              class="edit-btn" 
              @click="editRecipe(recipe)"
            >
              ✏️ Edit
            </ion-button>

            <ion-button 
              size="small" 
              color="danger" 
              class="delete-btn" 
              @click="deleteRecipe(recipe.id)"
            >
              🗑️ Delete
            </ion-button>
          </div>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonTextarea, IonButton
} from '@ionic/vue'

import { ref, onMounted } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

// FORM DATA
const recipeName = ref('')
const category = ref('')
const ingredients = ref('')
const instructions = ref('')
const preparationTime = ref('')

// RECIPES LIST
const recipes = ref<any[]>([])

// EDITING RECIPE TRACKER
const editingRecipeId = ref<string | null>(null)

// READ
const loadRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'))
    recipes.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading recipes:', error)
  }
}

// CREATE
const saveRecipe = async () => {
  if (!recipeName.value.trim()) {
    alert('Please enter a recipe name!')
    return
  }

  try {
    await addDoc(collection(db, 'recipes'), {
      recipeName: recipeName.value,
      category: category.value,
      ingredients: ingredients.value,
      instructions: instructions.value,
      preparationTime: preparationTime.value
    })

    alert('Recipe saved successfully!')
    clearForm()
    loadRecipes()
  } catch (error) {
    console.error('Error saving recipe:', error)
    alert('Failed to save recipe.')
  }
}

// UPDATE
const editRecipe = (recipe: any) => {
  editingRecipeId.value = recipe.id
  recipeName.value = recipe.recipeName
  category.value = recipe.category
  ingredients.value = recipe.ingredients
  instructions.value = recipe.instructions
  preparationTime.value = recipe.preparationTime

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateRecipe = async () => {
  if (!editingRecipeId.value) return

  try {
    const recipeRef = doc(db, 'recipes', editingRecipeId.value)
    await updateDoc(recipeRef, {
      recipeName: recipeName.value,
      category: category.value,
      ingredients: ingredients.value,
      instructions: instructions.value,
      preparationTime: preparationTime.value
    })

    alert('Recipe updated successfully!')
    clearForm()
    loadRecipes()
  } catch (error) {
    console.error('Error updating recipe:', error)
    alert('Failed to update recipe.')
  }
}

// DELETE
const deleteRecipe = async (recipeId: string) => {
  const confirmDelete = confirm('Are you sure you want to delete this recipe?')
  if (!confirmDelete) return

  try {
    await deleteDoc(doc(db, 'recipes', recipeId))
    alert('Recipe deleted successfully!')
    loadRecipes()
  } catch (error) {
    console.error('Error deleting recipe:', error)
    alert('Failed to delete recipe.')
  }
}

// CANCEL & CLEAR
const cancelEdit = () => {
  clearForm()
}

const clearForm = () => {
  recipeName.value = ''
  category.value = ''
  ingredients.value = ''
  instructions.value = ''
  preparationTime.value = ''
  editingRecipeId.value = null
}

onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
/* BACKGROUND & THEME COLOR PALETTE */
.modern-asian-theme {
  --ion-background-color: #F4F1EA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.top-nav-toolbar {
  --background: #F4F1EA;
  --color: #1E2A47;
  padding: 8px 10px 0 10px;
}

.app-region-title {
  font-weight: 800;
  font-size: 1.3rem;
  color: #1E2A47;
}

.app-body-content {
  --background: #F4F1EA;
}

/* WELCOME SECTION */
.welcome-section {
  text-align: center;
  margin: 10px 0 20px 0;
}

.welcome-section h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1E2A47;
  margin-bottom: 4px;
}

.welcome-section p {
  margin: 0;
  color: #6C7A89;
  font-size: 0.95rem;
}

/* FORM CARD CONTAINERS */
.form-card-container {
  background: #EAE5D9;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 25px;
}

.form-card-header h3 {
  margin: 0 0 14px 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1E2A47;
}

.custom-form-group {
  margin-bottom: 12px;
}

.custom-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1E2A47;
  margin-bottom: 5px;
  display: block;
}

.stylish-input-item {
  --background: #F4F1EA;
  border-radius: 12px;
  --padding-start: 12px;
  --color: #1E2A47; /* Kulay ng tina-type na text */
}

/* READABLE PLACEHOLDER STYLING */
ion-input::placeholder,
ion-textarea::placeholder,
ion-input:::placeholder,
ion-textarea:::placeholder {
  color: #64748B !important; /* Muted Slate Grey para malinaw at readable */
  opacity: 0.85 !important;
}

.submit-form-btn {
  --background: #1E2A47;
  --color: #FFFFFF;
  --border-radius: 12px;
  margin-top: 18px;
  font-weight: 700;
}

.cancel-form-btn {
  --color: #1E2A47;
  --border-color: #1E2A47;
  --border-radius: 12px;
  margin-top: 8px;
  font-weight: 600;
}

/* SECTION TITLE */
.recipes-title {
  margin-top: 25px;
  margin-bottom: 15px;
}

.recipes-title h2 {
  font-weight: 800;
  color: #1E2A47;
  margin: 0 0 2px 0;
  font-size: 1.3rem;
}

.recipes-title p {
  margin: 0;
  color: #6C7A89;
  font-size: 0.88rem;
}

/* SAVED RECIPES DARK CARDS */
.recipe-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dark-recipe-card {
  background: #1E2A47;
  color: #FFFFFF;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.recipe-name-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
}

.category-pill-badge {
  background: #E5E0D4;
  color: #1E2A47;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.recipe-info h4 {
  font-size: 0.88rem;
  color: #D1D9E6;
  margin: 12px 0 3px 0;
  font-weight: 700;
}

.recipe-info p {
  font-size: 0.85rem;
  color: #B0C0D8;
  margin: 0;
  line-height: 1.4;
}

.formatted-instructions {
  white-space: pre-line;
}

/* ACTION BUTTONS */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.edit-btn {
  --background: #FFFFFF;
  --color: #1E2A47;
  --border-radius: 10px;
  font-weight: 700;
}

.delete-btn {
  --border-radius: 10px;
  font-weight: 700;
}

/* EMPTY STATE */
.empty-message {
  text-align: center;
  padding: 30px 10px;
  color: #6C7A89;
}

.empty-bowl-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.empty-message h3 {
  font-weight: 700;
  margin-bottom: 4px;
}

.empty-message p {
  margin: 0;
  font-size: 0.88rem;
}
</style>