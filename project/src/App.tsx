import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Alert, Badge } from 'react-bootstrap';
import { Plus, Edit3, Trash2, Check, X, Search, Filter } from 'lucide-react';
import './App.css';

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTodo) {
      // Update existing todo
      setTodos(todos.map(todo =>
        todo.id === editingTodo.id
          ? { ...todo, ...formData }
          : todo
      ));
      setEditingTodo(null);
    } else {
      // Create new todo
      const newTodo: Todo = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: new Date()
      };
      setTodos([newTodo, ...todos]);
    }

    setFormData({ title: '', description: '', priority: 'medium' });
    setShowModal(false);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && !todo.completed) ||
                         (filterStatus === 'completed' && todo.completed);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length
  };

  return (
    <div className="app-container">
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-gradient mb-3">
                Todo Manager
              </h1>
              <p className="lead text-muted">
                Organize your tasks efficiently with our beautiful todo app
              </p>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="stats-card border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h5 className="text-primary mb-1">{stats.total}</h5>
                    <small className="text-muted">Total Tasks</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stats-card border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h5 className="text-success mb-1">{stats.completed}</h5>
                    <small className="text-muted">Completed</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stats-card border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h5 className="text-warning mb-1">{stats.active}</h5>
                    <small className="text-muted">Active</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Controls */}
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <Filter size={16} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={3}>
                <Button
                  variant="primary"
                  className="w-100 add-btn"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={16} className="me-2" />
                  Add Todo
                </Button>
              </Col>
            </Row>

            {/* Todo List */}
            <Row>
              {filteredTodos.length === 0 ? (
                <Col>
                  <Alert variant="info" className="text-center py-5">
                    <h5>No todos found</h5>
                    <p className="mb-0">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first todo to get started!'}
                    </p>
                  </Alert>
                </Col>
              ) : (
                filteredTodos.map((todo) => (
                  <Col key={todo.id} lg={6} className="mb-3">
                    <Card className={`todo-card h-100 border-0 shadow-sm ${todo.completed ? 'completed' : ''}`}>
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg={getPriorityColor(todo.priority)} className="priority-badge">
                            {todo.priority.toUpperCase()}
                          </Badge>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(todo)}
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(todo.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <h5 className={`card-title mb-2 ${todo.completed ? 'text-decoration-line-through' : ''}`}>
                          {todo.title}
                        </h5>
                        
                        <p className={`card-text flex-grow-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                          {todo.description}
                        </p>
                        
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <small className="text-muted">
                            {todo.createdAt.toLocaleDateString()}
                          </small>
                          <Button
                            variant={todo.completed ? "success" : "outline-success"}
                            size="sm"
                            onClick={() => toggleComplete(todo.id)}
                          >
                            {todo.completed ? <Check size={14} /> : <X size={14} />}
                            {todo.completed ? ' Completed' : ' Mark Complete'}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </Col>
        </Row>

        {/* Modal for Add/Edit Todo */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter todo title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter todo description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingTodo ? 'Update Todo' : 'Add Todo'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}

export default App;