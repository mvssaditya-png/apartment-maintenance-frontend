import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FlatSelector({ flats, selectedFlat, onSelectFlat }) {
  const [search, setSearch] = useState("");

  const filteredFlats = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return flats;

    return flats.filter((flat) => {
      const flatNumber = String(flat.flatNumber || "").toLowerCase();
      const ownerName = String(flat.ownerName || "").toLowerCase();

      return flatNumber.includes(q) || ownerName.includes(q);
    });
  }, [search, flats]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Flat</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search flat number or owner"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {selectedFlat && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedText}>
            Selected: Flat {selectedFlat.flatNumber}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.listBox}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        >
        {filteredFlats.map((flat,index) => (
          <TouchableOpacity
            key={`${flat.flatId}-${index}`}
            style={[
              styles.flatRow,
              selectedFlat?.flatId === flat.flatId && styles.flatRowActive,
            ]}
            onPress={() => {
              onSelectFlat(flat);
              setSearch("");
            }}
          >
            <View>
              <Text style={styles.flatNumber}>Flat {flat.flatNumber}</Text>
              <Text style={styles.ownerName}>{flat.ownerName || "-"}</Text>
            </View>

            {selectedFlat?.flatId === flat.flatId && (
              <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
            )}
          </TouchableOpacity>
        ))}

        {filteredFlats.length === 0 && (
          <Text style={styles.noResult}>No flats found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  selectedBox: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  selectedText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  listBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 260,
  },

  flatRow: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  flatRowActive: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },

  flatNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  ownerName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  noResult: {
    textAlign: "center",
    padding: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
});