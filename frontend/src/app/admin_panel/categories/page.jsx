"use client";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import axios from "axios";
import { useToast } from "@/components/ToastProvider";

const INDENT_STEP = 20;

export default function Categories() {
  const [editedId, setEditedId] = useState(null);
  const [newcategory, setNewCategory] = useState("");
  const { addToast } = useToast();
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/get_stores",
    fetcher
  );
  const tree = data?.categories ?? [];
  const renderNode = (node, depth = 0) => {
    const indent = depth * INDENT_STEP + 15;
    const isEdited = editedId === node.id;
    return (
      <div key={node.id} className="flex flex-col gap-3">
        <div className="rounded border border-border bg-bg-secondary">
          <div
            className="flex items-center justify-between p-4"
            style={{ paddingLeft: `${indent}px` }}
          >
            <p className="flex flex-row gap-2 text-sm font-medium ">
              <span>{depth > 0 && "↳ "}</span>
              <span>{node.name}</span>
            </p>
            <div className="flex items-center gap-3 text-text-secondary">
              <button
                type="button"
                onClick={() =>
                  setEditedId((prev) => (prev === node.id ? null : node.id))
                }
                className="text-sm cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              {node.parent_id !== null ? (
                <button
                  type="button"
                  onClick={() => deleteCategory(node.id)}
                  className="text-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              ) : null}
            </div>
          </div>
          {isEdited ? (
            <div className="flex flex-row gap-4 p-4">
              <input
                type="text"
                placeholder="Nowa Kategoria"
                className="py-2 px-4 bg-bg-primary rounded border border-border w-full"
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type="button"
                className="py-2 px-4 bg-primary rounded"
                onClick={() => addCategory(node.id, newcategory)}
              >
                Dodaj
              </button>
            </div>
          ) : null}
        </div>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  async function addCategory(parent_id, name) {
    try {
      const slug = name.toLowerCase();
      const res = await axios.post(
        `http://localhost:5000/api/admin/add_category`,
        { name, slug, parent_id },
        { withCredentials: true }
      );
      setEditedId(null);
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  async function deleteCategory(id) {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/delete_category`,
        { id },
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }
  return (
    <div className="flex flex-1 w-full flex-col gap-8 items-center px-6 py-12">
      <div className="flex flex-row w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <h1 className="text-3xl font-semibold">Kategorie</h1>
      </div>
      <div className="flex flex-col p-10 gap-6 w-full md:w-10/12 lg:w-8/12 xl:w-6/12 max-h-[630px] overflow-auto hide-scrollbar bg-bg-secondary rounded-lg">
        {isLoading ? (
          <p className="w-full text-center">Wczytywanie danych....</p>
        ) : error ? (
          <p className="w-full text-center">Błąd wczytywania danych</p>
        ) : tree.length ? (
          tree.map((category) => renderNode(category))
        ) : (
          <p className="w-full text-center text-sm text-text-tertiary">
            Brak kategorii do wyświetlenia
          </p>
        )}
      </div>
    </div>
  );
}
