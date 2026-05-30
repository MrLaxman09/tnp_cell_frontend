import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import api from "@/api/axios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");



  /* FETCH CONTACTS */
  const fetchContacts = async () => {
    const res = await api.get("/contacts");
    setReports(res.data.contacts);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  /* MARK AS READ */
  const markAsRead = async (id) => {
    await api.put(`/contacts/${id}/read`);
    fetchContacts();
  };

  /* DELETE */
  const deleteContact = async () => {
    await api.delete(`/contacts/${deleteItem._id}`);
    setDeleteItem(null);
    fetchContacts();
  };

  /* SEARCH FILTER */
const filtered = reports.filter((r) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    (r.name || "").toLowerCase().includes(searchText) ||
    (r.email || "").toLowerCase().includes(searchText) ||
    (r.subject || "").toLowerCase().includes(searchText);

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "read" && r.isRead) ||
    (statusFilter === "unread" && !r.isRead);

  return matchesSearch && matchesStatus;
});


  /* EXPORT CSV */
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Subject", "Message", "Date", "Status"];

    const rows = filtered.map((r) => [
      r.name,
      r.email,
      r.subject,
      r.message.replace(/(\r\n|\n|\r)/gm, " "),
      new Date(r.createdAt).toLocaleDateString(),
      r.isRead ? "Read" : "Unread",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contact_reports.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contact Reports</h1>
        <p className="text-muted-foreground">
          View inquiries and messages submitted via the contact form
        </p>
      </div>

      {/* SEARCH / FILTER / EXPORT */}
      <Card className="mb-4">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border rounded-md px-3 h-10 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    <p className="font-medium flex gap-2 items-center">
                      {r.name}
                      {!r.isRead && (
                        <Badge className="bg-green-500 text-white text-xs">
                          NEW
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </TableCell>

                  <TableCell>{r.subject}</TableCell>

                  <TableCell className="truncate max-w-md">
                    {r.message}
                  </TableCell>

                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge variant={r.isRead ? "secondary" : "default"}>
                      {r.isRead ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewItem(r)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Message
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteItem(r)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No contact messages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <AlertDialog open={!!viewItem}>
            <AlertDialogContent className="max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Message Details</AlertDialogTitle>
              </AlertDialogHeader>

              {viewItem && (
                <div className="space-y-3 text-sm">
                  <p>
                    <b>Name:</b> {viewItem.name}
                  </p>
                  <p>
                    <b>Email:</b> {viewItem.email}
                  </p>
                  <p>
                    <b>Subject:</b> {viewItem.subject}
                  </p>
                  <p>
                    <b>Date:</b> {new Date(viewItem.createdAt).toLocaleString()}
                  </p>

                  <div>
                    <b>Message:</b>
                    <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-line">
                      {viewItem.message}
                    </p>
                  </div>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setViewItem(null)}>
                  Close
                </AlertDialogCancel>

                {!viewItem?.isRead && (
                  <AlertDialogAction
                    onClick={() => {
                      markAsRead(viewItem._id);
                      setViewItem(null);
                    }}
                  >
                    Mark as Read
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!deleteItem}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteContact}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReports;
