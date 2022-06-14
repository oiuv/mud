## 说明

    FTP文件传输守护进程

## 继承

    inherit F_DBASE;

## 属性

    mapping socket_info;
    int our_socket;
    mapping temp_map;
    int number_of_users;
    int rest_pos

## 方法

    void remove();
    void lose_connection(int fd);
    void lose_user(int fd);
    int strncmp(string str, string sub, int i);
    int check_valid_read(string fname, int fd);
    int check_valid_write(string fname, int fd);
    mapping query_sinfo();
    mapping *query_connections();
    protected void setup_ftp(int port);
    void in_write_callback(int fd);
    void in_listen_callback(int fd);
    string ls(string path, int column, int fd);
    buffer to_stream(buffer buf);
    void data_write_callback(int fd);
    protected void data_conn(int fd, string mess, string name, int type);
    protected void read_connection(int fd, string path, int append);
    void data_read_callback(int fd, mixed mess);
    void data_close_callback(int fd);
    protected void logout(int fd);
    protected void parse_comm(int fd, string str);
    void in_read_callback(int fd, string str);
    void in_close_callback(int fd);
    protected string get_path(int fd, string str);
    protected void check_connections();
    void resolve_callback(string address, string resolved, int key);
