// versiond.c

#include <ansi.h>
#include <runtime_config.h>
#include <getconfig.h>
#include <net/socket.h>
#include <version.h>

// #pragma optimize
// #pragma save_binary

inherit F_DBASE;
inherit F_SAVE;

#define AGENT_IP        ({})

// 删除命令
#define RM_CMD          "/cmds/wiz/rm"

// 保存版本文件的目录：这个目录由于需要和普通文件路径名进行
// 连接使用，所以不能以"/"结尾，这一点和globals.h中的许多路
// 径名不一样，因此这个宏也不定义在那里。
#define VERSION_DIR     "/version"

// 保存版本文件数据的变量(在DBASE变量中的路径)
#define FILES           "/files"
#define STATS           "/stats"

// 在服务器端，数据库信息中应该只有FILES， 记录了所有在版本
// 中的文件的修改时间，以供客户端用来比较是否有差别。
// 在客户端，数据库信息中有FILES和STATS， 其中FILES包含了本
// 地使用的所有文件的版本(即在服务器上文件的最后修改时间)，
// 含义和服务器端的FILES数据是相同的。但是STATS则是最后一次
// 同步版本的时候，生成的文件的时间。这样，在下一次同步版本
// 的时候，如果FILES内的数据相同，就看STATS和本地文件的时间
// 是否吻合，如果不吻合，说明虽然服务器没有修改这个文件，但
// 是本地这个文件却已经发生过变化，所以仍然需要同步。
// 注意：STATS和FILES是不同构的，对于所有的源文件".c"来说，
// 在FILES中记录的是".c"的路径，而在STATS记录的是".b"的路径，
// 这是因为FILES面对服务器文件，而STATS面对本地文件。

// VERSIOND的BUG
// 在编译生成版本的时候，get_file_version函数会调用一个模拟
// 外部函数：binary_valid，来检查某一个源文件的二进制代码是
// 否过期，这是一个DOING增强的函数，需要修改MUDOS才能够使用，
// 如果你不想修改MUDOS，可以在simul_efun 中自行书写，但是这
// 样会显著的降低效率而导致事实无法使用，因此可以采用变通的
// 方式，即简单的比较源文件和二进制文件的时间，而不检查他的
// 继承对象和嵌入文件。这样在生成版本的时候就需要格外小心。
// 使用了增强的EFUN函数以后，也并不能保证完全正确。这是因为
// 该函数只检查了第一层继承关系，如果再上一层继承的文件过时
// 了，该函数就无法检查。因此在每次修改一个文件从新编译的时
// 候，最好考虑使用updatei 来更新整个继承链表，虽然这样仍然
// 有可能出现问题，但是几率将会相当的小。如果变化比较复杂，
// 建议全部重新编译。

// 从版本服务器取回的文件后缀
#define APPENDFIX       ".svr"

// 监听的端口(以MUD的启动端口为基准)
#define VERSION_PORT    12

// 不需要构造的目录
STATIC_VAR_TAG string *exclude_dir = ({ "/adm/etc", "/adm/log", "/adm/daemons", "/.git",
                                "/data", "/backup", "/log", "/dump", "/temp", "/binaries", VERSION_DIR,
                                "/clone", "/include", "/help", "/d", "/cmds", "/feature", "/kungfu", "/inherit", "/b", "/shadow",
                                "/doc", "/grant", "/u", });
// 额外需要构造的文件
STATIC_VAR_TAG string *include_dir = ({ "/data/e2c_dict.o", "/data/emoted.o", "/data/newsd.o",
                                "/adm/etc/quest", "/adm/etc/preload" });

// 需要发布C源程序的目录
STATIC_VAR_TAG string *release_src = ({ "/clone/misc/wedding-ring.c",
                                "/clone/misc/depot_ob.c",
                                "/d/room/%*s" });

// 保存二进制代码的路径
STATIC_VAR_TAG string bin_path;

// 各地连接的信息
STATIC_VAR_TAG mapping socket_info;

// 客户端的连接信息
STATIC_VAR_TAG mixed *client_info = 0;

// 版本通讯的SOCKET
STATIC_VAR_TAG int vfd;
STATIC_VAR_TAG int version_ok;

// build_version整理版本时使用的变量
STATIC_VAR_TAG int total_error;
STATIC_VAR_TAG int total_count;
STATIC_VAR_TAG int total_finish;
STATIC_VAR_TAG mixed *total_build;

// 手工获得文件列表
string *fetch_file_list = 0;

#if 0
#define DEBUG_LOG(s)       tell_object(find_player("ivy"), s)
#else
#define DEBUG_LOG(s)
#endif

#define T_DEBUG(str) CHANNEL_D->do_channel(this_object(), "debug", str)

// 提供给外部的函数
int generate_version();
int build_cancel();
int build_path(string path);
int synchronize_version();
int fetch_file(string file);
int clear_syn_info();
int is_version_ok();
int is_boot_synchronizing();
int is_release_server();
int is_need_release_source(string path);
int append_sn(string file);

// 内部使用的函数
private void setup();
private void sys_info(string msg);
private void debug_info(string msg);
private int  connect_server();
private void build_init_data();
private void build_finish();
private void build_version(string path, mapping here);
private int  build_pure_file(mixed *path_info);
private int  get_file_version(string path);
private void send_command(int fd, string cmd);
private int  send_client_pending_msg();
private void syn_receive_result(string str);
private int  syn_receive_file(buffer buf);
private void syn_load_file(string file, int ver);
private void syn_load_version(string path, mapping store);
private void syn_finish();
private void syn_reboot_mud();
private void syn_fetch_file_from_server();
private void syn_check_version_file();
private void syn_read_callback(int fd, mixed str);
private void syn_write_callback(int fd);
private void syn_close_callback(int fd);
private void in_listen_callback(int fd);
private void in_read_callback(int fd, string str);
private void in_write_callback(int fd);
private void in_close_callback(int fd);
private void parse_cmd(int fd);
private void cmd_getver(int fd, string arg);
private void cmd_get(int fd, string arg);
private void send_file(int fd, string file, string peer_name);
private void syn_get_version_data();
private int  send_pending_msg(int fd);
private int  send_result(int fd, string msg);
private int  send_error_msg(int fd, string msg);
private void send_version(int fd);
private void remove_connection(int fd);
private void cmd_close(int fd, string arg);

string query_save_file() { return DATA_DIR + "versiond"; }

int clean_up() { return 0; }

void create()
{
        seteuid(getuid());
        restore();

        // 初始化一些信息
        bin_path = get_config(__SAVE_BINARIES_DIR__);
        set("channel_id", "版本精灵");

        // 还没有检查版本
        version_ok = 0;
        total_build = 0;

        // 启动初始化
        setup();
}

// 析构函数
void remove(string euid)
{
        if (! this_player())
                return;

        if (sizeof(socket_info) > 0)
                error("版本精灵：目前正在有站点和本站同步版本，你不能摧毁版本精灵。\n");

        if (! version_ok && vfd)
                error("版本精灵：目前版本正在同步中，你不能摧毁版本精灵。\n");
}

private void setup()
{
        if (RELEASE_SERVER() == "local")
        {
                // 总站的版本是不需要同步更新的
                version_ok = 1;

                // 2s以后提供版本服务功能
                call_out("in_server", 2);
        } else
        if (stringp(RELEASE_SERVER()) &&
            sscanf(RELEASE_SERVER(), "%*s %*d") == 2)
        {
                // 这里是分站，尝试和总站进行同步
                if (this_player())
                {
                        // 不是系统自动启动的，因此不检查版本
                        version_ok = 1;
                        write("你重新启动了版本精灵。\n");
                        return;
                }

                // 2s以后和总站同步版本
                call_out("synchronize_version", 2);
        } else
        {
                // 配置信息不正确
                write("配置信息(/adm/etc/config)错误，没有指明版本服务器(release server)。\n");
                version_ok = 1;
                return;
        }
}

// 提供版本服务
private void in_server()
{
        int port;
        return;

        // 这里是版本发布站点，在该端口上监听分站的请求
        // 创建版本通讯的SOCKET
        vfd = socket_create(STREAM_BINARY,
                            "in_read_callback",
                            "in_close_callback" );

	if (vfd < 0)
        {
                log_file("version", sprintf("%s Failed to create socket.\n", log_time()));
		return;
	}

        // 然后绑定SOCKET
        port = get_config(__MUD_PORT__) + VERSION_PORT;
	if (socket_bind(vfd, port) < 0)
        {
		log_file("version", sprintf("%s Failed to bind socket.\n", log_time()));
		socket_close(vfd);
		return;
	}

        // 最后监听
	if (socket_listen(vfd, "in_listen_callback" ) < 0)
        {
		log_file("version", sprintf("%s Failed to listen to socket.\n", log_time()));
		return;
	}

        // 初始化连接信息
        socket_info = ([ ]);
}

// 在本机上生成版本
int generate_version()
{
//      mapping dbase;
        string file;
        mapping store;

        if (RELEASE_SERVER() != "local")
                return notify_fail("只有在版本发布的MUD中才能生成最新版本。\n");

        if (! is_root(previous_object()))
                return 0;

        if (query_heart_beat() || arrayp(total_build))
                return notify_fail("现在正在整理版本。\n");

        if (! binary_valid(VERSION_D + ".c"))
                return notify_fail("请先更新(update)版本精灵，以保证它是最新版本。\n");

        // 如果生成了core文件，则删除之
        rm("/core");

        // 将原先所有的版本信息数据保存到临时变量中
        set_temp(FILES, query(FILES));
        delete(FILES);

        // 重新设置数据
        set("version", time());

        log_file("version", sprintf("%s new version [%d] now generated.\n",
                                    log_time(), query("version")));

        // 构造/目录下面的版本
        store = ([ ]);
        set(FILES, store);

        // 初始化整理信息
        build_init_data();

        message_system("系统正在生成可以执行的发布版本，您的游戏速度可能会受到影响。\n");
        write("开始生成版本...\n");

        build_version("/", store);

        // 构造所有额外文件的版本
        foreach (file in include_dir)
                build_version(file, 0);

        // 开始心跳，进行版本整理
        set_heart_beat(1);
        log_file("version", sprintf("%s %s start build version.\n",
                                    log_time(), this_player() ? geteuid(this_player()) : "SYSTEM"));

        return 1;
}

// 终止生成版本
int build_cancel()
{
        if (! arrayp(total_build))
                return notify_fail("现在并没有正在生成版本。\n");

        // 清除版本号
        set("version", 0);
        save();

        // 清空数据
        build_finish();

        // 停止心跳
        set_heart_beat(0);
        write("终止了正在生成版本的操作：目前的版本介于两种版本之间，可能会导致不稳定。\n");
        return 1;
}

// 心跳函数：整理版本中所有的普通文件
private void heart_beat()
{
        int n;
        int percent;
        mixed *piece;

        if (! arrayp(total_build))
        {
                // 现在没有版本可以整理
                set_heart_beat(0);
                return;
        }

        n = 0;
        while (n < 100 && sizeof(total_build))
        {
                // 整理某一个目录
                reset_eval_cost();
                piece = total_build[0];
                total_build = total_build[1..<1];
                n += build_pure_file(piece) + 1;
        }

        total_finish += n;
        if (total_count < total_finish) total_count = total_finish;

        percent = total_finish * 100 / total_count;
        if (percent / 10 != query_temp("last_prompt") / 10)
        {
                // 每过10%则提示一下所有用户。
                message_system("系统整理版本中，已经完成 " + percent + "%...");
                set_temp("last_prompt", percent);
        } else
                sys_info("已经完成 " + percent + "%...");

        if (sizeof(total_build))
                return;

        // 整理完毕
        save();
        log_file("version", sprintf("%s Total %d error when generate version [%d]\n",
                                    log_time(), total_error, query("version")));
        sys_info("版本整理完毕。在生成版本中一共发生了 " + total_error + " 个错误。");
        message_system("系统生成版本完毕。\n");

        // 还原数据
        build_finish();

        set_heart_beat(0);
}

// 生成一个新的版本号
int build_new()
{
        int ver;

        if (! is_root(previous_object()))
                return notify_fail("只有ROOT_UID才有权限调用这个函数。\n");

        // 判断现在的状态
        if (arrayp(total_build))
                return notify_fail("现在正在整理版本。\n");

        // 生成新的版本号
        set("version", ver = time());
        save();
        write(sprintf("生成了新的版本号：%d\n", ver));
        return 1;
}

// 生成某个路径下面的版本
int build_path(string path)
{
        if (! is_root(previous_object()))
                return notify_fail("只有ROOT_UID才有权限调用这个函数。\n");

        // 去掉末尾的"/"
        while (strlen(path) > 1 && path[strlen(path) - 1] == '/')
                path = path[0..<2];

        if (file_size(path) == -1)
                return notify_fail("没有对应这个路径名的文件或是路径，不能进入版本。\n");

        bin_path = get_config(__SAVE_BINARIES_DIR__);
        if (path[0..strlen(bin_path) - 1] == bin_path)
                return notify_fail("二进制文件不需要进入版本。\n");

        // 判断现在的状态
        if (arrayp(total_build))
                return notify_fail("现在正在整理版本。\n");

        if (! binary_valid(VERSION_D + ".c"))
                return notify_fail("请先更新(update)版本精灵，以保证它是最新版本。\n");

        // 如果生成了core文件，则删除之
        rm("/core");

        build_init_data();
        write("现在开始整理版本。\n");
        build_version(path, 0);

        log_file("version", sprintf("%s %s start build path(%s).\n",
                                    log_time(),
                                    this_player() ? geteuid(this_player()) : "SYSTEM",
                                    path));
        if (sizeof(total_build))
                // 有纯文件需要build，启动心跳
                set_heart_beat(1);
        else
        {
                save();
                write("整理完毕。\n");
                build_finish();
        }

        return 1;
}

// 初始化构造的数据
private void build_init_data()
{
        total_build = ({ });
        total_error = 0;
        total_count = 0;
        total_finish = 0;
}

// 结束构造的数据
private void build_finish()
{
        total_build = 0;
        total_error = 0;
        total_count = 0;
        total_finish = 0;

        // 这是用来提示的变量
        set_temp("last_prompt", 0);

        // 去掉记录文件版本所使用的临时变量
        delete_temp(FILES);
}

// build_version在运行中把需要整理的信息加入到total_build这
// 个数据集合中，其中组织方式如下：
// total_build ----+-- 目录信息1 --+-- 全路径名
//                 |               |
//                 |               +-- 简单文件名集合
//                 |
//                 +---目录信息2 --+-- 全路径名
//                 |               |
//                 |               +-- 简单文件名集合
//                 ...
// total_error 错误的数量

// 完成某个路径的构造
// 返回该路径下文件的数目
private int build_pure_file(mixed *path_info)
{
        int count;
        string path;
        mapping here;
        string pname;
        string file;
        int ver;

        // 取整理的全路径名
        path = path_info[0];

        // 保证版本目录下建立了合适的路径(包括二进制路径)
        assure_file(VERSION_DIR + bin_path + path + "???");
        assure_file(VERSION_DIR + path + "???");

        // 去掉最后的'/'，用来做dbase的query操作。
        if (strlen(path) > 1) pname = path[0..<2];

        // 查看是否有为这个路径准备好版本数据结构，如果没有
        // 就创建数据结构
        if (! mapp(here = query(FILES + pname)))
        {
                here = ([ ]);
                set(FILES + pname, here);
        }

        // 取所有的文件的版本
        count = 0;
        foreach (file in path_info[1])
        {
                // 这是一个普通文件
                if (! (ver = get_file_version(path + file)))
                        total_error++;
                else
                        here[file] = ver;
                count++;
        }

        return count;
}

// 构造某个路径下面的版本
private void build_version(string path, mapping here)
{
        mixed piece;
        mixed *files;
        string *pure_files;
        int ver;

        if (member_array(path, exclude_dir) != -1)
                // 这个文件不需要进入版本，直接返回成功
                return;

        if (! mapp(here))
        {
                // 没有指定存放生成的版本信息的位置，检查这
                // 个路径的属性：普通文件还是目录
                switch (file_size(path))
                {
                case -1:
                        // 没有这个目录或是文件，直接继续
                        return;

                case -2:
                        // 这是一个目录，我首先需要确保生成合适的映
                        // 射数据
                        here = ([ ]);
                        set(FILES + path, here);
                        break;

                default:
                        // 这是一个普通文件，直接生成版本信息

                        // 首先保证版本目录下建立了合适的路径(包括二进制路径)
                        assure_file(VERSION_DIR + bin_path + path + "???");
                        assure_file(VERSION_DIR + path + "???");

                        if ((ver = get_file_version(path)) > 0)
                                set(FILES + path, ver);
                        return;
                }
        }

        // 取这个路径下面的所有文件
        if (path[strlen(path) - 1] != '/') path += "/";
        files = get_dir(path, -1);
        if (! arrayp(files))
                // 没有这个路径
                return 0;

        // 提示
        sys_info("正在整理路径：" + path);

        // 遍历本目录下面的所有文件
        foreach (piece in files)
        {
                reset_eval_cost();
                switch (piece[1])
                {
                case -2:
                        // 这是一个目录，构造下一级的数据
                        here[piece[0]] = ([ ]);
                        build_version(path + piece[0], here[piece[0]]);
                        piece[0] = 0;
                        break;

                default:
                        // 这是一个普通文件，略过，留待稍候整理
                        break;
                }
        }

        // 构造目录信息，以待整理程序整理
        pure_files = map_array(files, (: ((mixed *) $1)[0] :));
        pure_files -= ({ 0 });
        if (sizeof(pure_files))
        {
                total_build += ({ ({ path, pure_files }) });
                total_count += 1 + sizeof(pure_files);
        }
}

// 是否需要发布源程序
int is_need_release_source(string path)
{
//      string *files;
        string match;

        foreach (match in release_src)
                if (path == match || sscanf(path, match) == 1)
                        return 1;

        return 0;
}

// 返回文件的最新时间(C则返回二进制代码的时间)作为版本
private int get_file_version(string path)
{
        int last;
        mixed *st, *cst;
        string bpath;
        string cpath;
        object ob;
        object *uobs;
        int ver;
        int need_reload;

        cst = stat(path);
        if (! arrayp(cst) || sizeof(cst) < 2 || cst[0] < 0)
        {
                // 没有找到这个文件？
                log_file("version", sprintf("%s can't find file: %s\n",
                                            log_time(), path));
                return 0;
        }

        last = strlen(path) - 2;
        if (last > 0 && path[last + 1] == 'c' && path[last] == '.' &&
            ! is_need_release_source(path))
        {
                // 这是一个不能发布的c文件，我必须取它的二进
                // 制代码文件
                bpath = bin_path + path[0..last] + "b";
                st = stat(bpath);
                if (! arrayp(st) || sizeof(st) < 2)
                        // 没有这个文件
                        need_reload = 1;
                else
                if (st[0] == -2)
                {
                        // 这是一个目录
                        RM_CMD->rm_dir(bin_path);
                        need_reload = 1;
                } else
#if 0
                if (! binary_valid(path))
                        // 该文件需要重新编译
                        need_reload = 1;
#endif
                // doing 在这里削弱了判断的重新编译的条件，
                // 只要BIN文件的生成时间不老于C文件的时间就
                // 认为不需要编译，这是为了避免构造版本花费
                // 太多的时间。每次修改一些文件以后建议使用
                // updatei 编译所有继承文件。
                if (st[1] < cst[1])
                        // 该文件需要重新编译
                        need_reload = 1;

                if (need_reload)
                {
                        // 没有最新的binaries文件，我需要重
                        // 新编译这个文件。
                        if (objectp(ob = find_object(path)))
                        {
                                // 找到了这个OBJECT，记录里面的人物
                                uobs = filter_array(all_inventory(ob), (: playerp :));
                                uobs->move(VOID_OB, 1);
                                destruct(ob);
                        }

                        // 重新载入OBJECT
                        reset_eval_cost();
                        catch(ob = load_object(path));
                        if (objectp(ob) && sizeof(uobs))
                                // 移动人物回原先的OBJECT
                                uobs->move(ob, 1);

                        if (file_size(bpath) < 0)
                        {
                                // 还没有这个文件？有可能是
                                // 编译出错
                                log_file("version", sprintf("%s can't get binaries: %s\n",
                                                            log_time(), path));
                                return 0;
                        }

                        // 这个BIN肯定是刚刚生成的，直
                        // 接返回。
                        ver = time();
                } else
                        // 返回BIN文件的生成时间作为版本号
                        ver = st[1];

                // 记录需要复制的源文件名字(C需要复制BIN文件)
                cpath = bpath;
        } else
        {
                // 不是c文件，直接返回时间作为版本号
                ver = cst[1];

                // 记录需要复制的源文件名字(普通文件直接复制)
                cpath = path;
        }

        // 如果现在文件的版本和最后一次整理时的版本不一致，
        // 或是版本目录中没有这个文件，则将运行中的文件复制
        // 到版本目录中去。注意：这里有一个缺陷，那就是如果
        // 修改了版本目录中的文件，那么系统并不会检查，而是
        // 认为该文件版本仍然正确。所以修改VERSION 下面的文
        // 件是绝对被禁止的。
        switch (file_size(VERSION_DIR + cpath))
        {
        case -2:
                // 版本中存放的是一个路径。那么我需
                // 要先移走这个路径。
                sys_info(sprintf("file(%s) is a path in version dir, removed.", cpath));
                RM_CMD->rm_dir(VERSION_DIR + cpath);
                break;
        case -1:
                break;

        default:
                // 这个文件已经存在，比较记录的版本信息
                if (ver == query_temp(FILES + path))
                        // 版本相同，返回即可。
                        return ver;
        }

        // 需要复制这个文件进入版本路径
        cp(cpath, VERSION_DIR + cpath);
        last = strlen(cpath) - 2;

        if (cpath[last] == '.' && (cpath[last + 1] == 'c' || cpath[last + 1] == 'h'))
                // 源程序，需要增加完整性ID
                append_sn(VERSION_DIR + cpath);

        return ver;
}

// 获得服务器上的文件
int fetch_file(string file)
{
        object me;

        if (RELEASE_SERVER() == "local")
                return notify_fail("在版本发布站点上无需从服务器上获得文件。\n");

        if (arrayp(client_info) && client_info[STATUS] != STATUS_FINISHED)
                return notify_fail("现在版本正在同步中。\n");

        if (find_call_out("syn_reboot_mud") != -1)
                return notify_fail("现在版本精灵正在重新启动游戏，无法同步。\n");

        fetch_file_list = ({ file });

        if (objectp(me = this_player(1)))
                set_temp("operator", filter_color(me->name(1)) + "(" +
                                     geteuid(me) + ")");
        else
                delete_temp("operator");

        if (! connect_server())
                return 0;

        write("正在连接服务器获取文件。\n");
        return 1;
}

// 同步主机版本
int synchronize_version()
{
        object me;

        if (RELEASE_SERVER() == "local")
                return notify_fail("在版本发布站点上无需同步最新版本。\n");

        if (arrayp(client_info) && client_info[STATUS] != STATUS_FINISHED)
                return notify_fail("现在版本正在同步中。\n");

        if (find_call_out("syn_reboot_mud") != -1)
                return notify_fail("现在版本精灵正在重新启动游戏，无法同步。\n");

        // 清除变量，保证同步版本
        fetch_file_list = 0;

        if (objectp(me = this_player(1)))
                set_temp("operator", filter_color(me->name(1)) + "(" +
                                     geteuid(me) + ")");
        else
                delete_temp("operator");

        // 设置标志：版本还没有成功的同步
        version_ok = 0;
        delete_temp("version_changed");

        if (! connect_server())
                return 0;

        write("你开始和服务器同步版本。\n");
        return 1;
}

private int connect_server()
{
        string addr, port;
        int ret_val;

        // 创建版本通讯的SOCKET
        vfd = socket_create(STREAM_BINARY,
                            "syn_read_callback",
                            "syn_close_callback" );

	if (vfd < 0)
        {
                log_file("version", sprintf("%s Failed to create socket.\n",
                                            log_time()));
		return notify_fail("无法创建SOCKET.\n");
	}

        // 初始化客户端信息
        client_info = allocate(7);
        client_info[STATUS] = STATUS_CONNECTING;
        client_info[FILE_NAME] = 0;
        client_info[FILE_POS] = 0;
        client_info[FILE_SIZE] = 0;
        client_info[RESULT_BUFFER] = "";
        client_info[PENDING_WRITE] = ({ });

        if (sscanf(RELEASE_SERVER(), "%s %d", addr, port) != 2)
        {
                log_file("version", sprintf("%s Bad address(%s) of server.\n",
                                            log_time(), RELEASE_SERVER()));
                return notify_fail("配置的版本服务器的地址不正确。\n");
        }

        // 生成版本服务器的连接地址
        addr = sprintf("%s %d", addr, port + VERSION_PORT);

        ret_val = socket_connect(vfd, addr,
                                 "syn_read_callback",
                                 "syn_write_callback");
        if (ret_val != EESUCCESS)
        {
                log_file("version", sprintf("%s Failed to connect server.\n",
                                            log_time()));
                return notify_fail("无法连接版本服务器。\n");
        }

        log_file("version", sprintf("%s connecting to server %s.\n",
                                    log_time(), addr));
        return 1;
}

// 清除同步信息
int clear_syn_info()
{
//      int result;
        int fd;

        if (previous_object() && ! is_root(previous_object()))
                return 0;

        // 服务器端：清除套接字的连接信息
        if (is_release_server())
        {
                if (sizeof(socket_info) > 0)
                {
                        foreach (fd in keys(socket_info))
                                if (intp(fd)) socket_close(fd);

                        socket_info = ([ ]);
                        return 1;
                }

                return 0;
        }

        // 客户端：清除同步的SOCKET和信息
        if (vfd)
        {
                log_file("version", sprintf("%s 暂停了同步版本的操作。\n", log_time()));
                syn_finish();
                return 1;
        }

        return 0;
}

// 版本是否正常
int is_version_ok() { return version_ok; }

// 是否正在进行启动时同步版本
int is_boot_synchronizing()
{
        if (! version_ok && ! stringp(query_temp("operator")))
                return 1;
}

// 是否是版本发布服务器
int is_release_server() { return RELEASE_SERVER() == "local"; }

// 测试
mixed query_client_info() { return client_info; }
mixed query_socket_info() { return socket_info; }
int query_vfd() { return vfd; }

// 从服务器获得文件
private void syn_get_file(string file)
{
        if (client_info[STATUS] != STATUS_SYN)
                return;

        send_command(vfd, "get " + file);
}

// 从服务器获得版本数据
private void syn_get_version_data()
{
        if (client_info[STATUS] != STATUS_GET_VERSION)
                return;

        // 更改状态成为正在获得文件
        client_info[STATUS] = STATUS_GET_VERSION_DATA;
        send_command(vfd, "getver dbase");
}

// 向服务器端发送命令
void send_command(int fd, string cmd)
{
        if (! fd)
                // 检查当前连接的VFD
                if (! (fd = vfd)) return;


        cmd += "\n";
        if (sizeof(client_info[PENDING_WRITE]))
        {
                // 已经有阻塞需要发送的数据了，这次发送的数
                // 据先阻塞
                client_info[PENDING_WRITE] += ({ cmd });
                return;
        }

        switch (socket_write(fd, cmd))
        {
        case EESUCCESS:
        case EECALLBACK:
                // 发送成功了
                return;

        case EEWOULDBLOCK:
                // 发送数据阻塞
                client_info[PENDING_WRITE] += ({ cmd });
                call_out("syn_write_callback", 2, fd);
                return;

        default:
                // 发送失败
                client_info[PENDING_WRITE] += ({ cmd });
                return;
        }
}

// 客户端发送阻塞的消息
private int send_client_pending_msg()
{
        string msg;

        msg = client_info[PENDING_WRITE][0];
        switch (socket_write(vfd, msg))
        {
        case EESUCCESS:
                // 发送成功了
                client_info[PENDING_WRITE] = client_info[PENDING_WRITE][1..<1];
                return 0;

        case EECALLBACK:
                // 需要等待
                client_info[PENDING_WRITE] = client_info[PENDING_WRITE][1..<1];
                return -1;

        case EEWOULDBLOCK:
                // 发送数据阻塞
                call_out("syn_write_callback", 2, vfd);
                return -1;

        default:
                // 发送失败
                return -1;
        }
}

// 同步时客户端连接的读回调函数
// 由于服务器可能会返回两种数据：1 普通应答信息  2 二进制文
// 件数据。因此接收函数依据状态中的文件名字存在与否来鉴别这
// 两种状态：如果有文件名字，那么就认为是接收文件中，如果没
// 有，则是接收普通应答信息。普通应答信息一定是固定个字节，
// 以ASCII 方式存放。如果一次接收没有满足期望的字节，那么长
// 度将保存在FILE_POS里面。
private void syn_receive_result(string str)
{
        string file;
        string msg;
        int len;
        int ver;
        string op;

        if ((len = strsrch(str, '\n')) == -1)
        {
                // 返回的信息不正确 - 必须包含'\n'
                log_file("version", sprintf("%s respond without '\\n' from server: %s.\n",
                                            log_time(), str));
                DEBUG_LOG(sprintf(HIR "error syntax str = %s\n" NOR, str));
                return;
        }
        if (! len) return;
        str = str[0..len - 1];

        DEBUG_LOG(sprintf("str = %s\n", str));
        op = query_temp("operator");

        if (sscanf(str, RESULT_ERR "%s", msg))
        {
                // 遇到了错误，先记录进入日志
                log_file("version", sprintf("%s error respond: %s\n",
                                            log_time(), msg));
                DEBUG_LOG(str + "\n");
        }

        // 根据当前的状态进行处理
        switch (client_info[STATUS])
        {
        case STATUS_GET_VERSION:
                // 正在读取版本
                if (sscanf(str, RESULT_VERSION "%d", ver))
                {
                        // 返回了版本
                        log_file("version", sprintf("%s get version from server: %d\n",
                                                    log_time(), ver));

                        // 开始获得版本文件
                        if (query("version") != ver)
                        {
                                if (! stringp(op) && CONFIG_D->query("manual_synchronize"))
                                {
                                        // 系统自举，并且设置了手工同步版本的标志
                                        sys_info(sprintf("%s本地版本需要更新，但是系统"
                                                         "并不自动同步。\n"));
                                        version_ok = 1;
                                        set_temp("version_changed", 0);
                                        syn_finish();
                                        break;
                                }

                                // 版本不一致
                                log_file("version", sprintf("%s local version(%O) is not ok.\n",
                                                            log_time(), query("version")));
                                if (stringp(op))
                                {
                                        // 显示提示信息
                                        sys_info(sprintf("%s要求同步版本，本地的"
                                                         "版本(%O)需要更新为(%O)。",
                                                         op, query("version"), ver));
                                        message_system(sprintf("%s正在进行运行中同步版本。", op));
                                }

                                set_temp("version_changed", 1);
                                syn_get_version_data();
                        } else
                        {
                                // 版本一致
                                log_file("version", sprintf("%s local version ok.\n", log_time()));
                                if (stringp(op = query_temp("operator")))
                                        // 显示提示信息
                                        sys_info(sprintf("%s要求同步版本，但是本地"
                                                         "版本已经和服务器保持一致了。", op));
                                version_ok = 1;
                                set_temp("version_changed", 0);
                                syn_finish();
                        }
                        break;
                }

                // 没有返回正常的版本信息
                log_file("version", sprintf("%s can not get version. server report: %s\n",
                                            log_time(), str));

                // 怎么办？只有结束同步
                syn_finish();
                break;

        case STATUS_GET_VERSION_DATA:
                // 获得版本数据，执行和STATUS_GET_SYN相同

        case STATUS_SYN:
                // 接收文件的长度
                if (! sscanf(str, RESULT_FILE "%s %d", file, len))
                {
                        if (sscanf(str, RESULT_FINISH "%*s"))
                        {
                                log_file("version", sprintf("%s version synchronized.\n",
                                                            log_time()));
                                if (stringp(op))
                                        message_system(sprintf("%s已经将版本更新完毕。", op));
                                // 同步完毕，保存版本信息
                                save();
                                version_ok = 1;

                                // 读取news/chinesed/emoted
                                reset_eval_cost();
                                catch(NEWS_D->restore());
                                catch(CHINESE_D->restore());
                                catch(EMOTE_D->restore());
                                syn_finish();
                        }

                        break;
                }

                DEBUG_LOG(sprintf("file: %s len = %d\n", file, len));

                // 记录的接收文件状态和信息
                if (client_info[STATUS] == STATUS_GET_VERSION_DATA)
                        // 正在读取版本信息，更正文件名字
                        file = query_save_file() + __SAVE_EXTENSION__;

                // 记录传送来的文件的信息
                client_info[FILE_NAME] = file;
                client_info[FILE_POS] = 0;
                client_info[FILE_SIZE] = len;

                // 如果有，删除这个文件的临时文件
                rm(file + APPENDFIX);

                sys_info(sprintf("getting(%s)...", file));
                break;

        default:
                // 不应该接收到信息
        }
}

// 接收文件内容
private int syn_receive_file(buffer buf)
{
        mixed *st;
        string file;
        int len;
        int sl;

        file = client_info[FILE_NAME];
        len =  client_info[FILE_SIZE] - client_info[FILE_POS];
        if (len > sizeof(buf))
                // 不需要将buf中的数据全部写入
                len = sizeof(buf);

        write_buffer(file + APPENDFIX,
                     client_info[FILE_POS], buf[0..len - 1]);
        client_info[FILE_POS] += len;
        if (client_info[FILE_POS] < client_info[FILE_SIZE])
                // 文件还没有接收完毕
                return len;

        // 成功获取文件完毕
        log_file("version", sprintf("%s got file %s.\n",
                                    log_time(), client_info[FILE_NAME]));
        client_info[FILE_POS] = 0;
        client_info[FILE_NAME] = 0;
        client_info[FILE_SIZE] = 0;

        // 查看当前的状态
        switch (client_info[STATUS])
        {
        case STATUS_GET_VERSION_DATA:
                // 获得了版本数据，读取数据
                file += APPENDFIX;
                rm(file + __SAVE_EXTENSION__);
                rename(file , file + __SAVE_EXTENSION__);

                // 在静态数据中记录本地的文件版本和文件信息
                set_temp(FILES, query(FILES));
                set_temp(STATS, query(STATS));
                delete(FILES);
                delete(STATS);

                if (! restore_object(file))
                {
                        log_file("version", sprintf("%s can not read version-dbase got from server.\n",
                                                    log_time()));
                        rm(file + __SAVE_EXTENSION__);
                        syn_finish();
                        return sizeof(buf);
                }

                // 删除该文件
                rm(file + __SAVE_EXTENSION__);

                // 开始同步所有的文件
                syn_check_version_file();
                break;

        case STATUS_SYN:
                // 将文件名字修改为正常的名字
                rm(file);
                rename(file + APPENDFIX, file);

                // 如果这个文件是一个C文件，那么我必须删除
                // 它的BIN 文件，因为我需要重新编译它。
                sl = strlen(file) - 2;
                if (sl > 0 && file[sl] == '.' && file[sl + 1] == 'c')
                        rm(bin_path + file[0..sl] + "b");

                // 我记录这个文件的信息：如果是一个BIN文件，
                // 那么我有必要纪录C文件的时间，否则就纪录
                // 该文件自身。
                if (sscanf(file, bin_path + "%s", file) &&
                    strlen(file) > 1)
                        file[strlen(file) - 1] = 'c';

                st = stat(file);
                if (arrayp(st) && sizeof(st) >= 2)
                        set(STATS + file, st[1]);

                break;

        default:
                // 错误的状态
        }

        // 返回使用的BUFFER的长度
        return len;
}

// 从服务器上获取一批文件
private void syn_fetch_file_from_server()
{
        int i;

        client_info[STATUS] = STATUS_SYN;

        for (i = 0; i < sizeof(fetch_file_list); i++)
        {
                sscanf(fetch_file_list[i], VERSION_D "/%s", fetch_file_list[i]);
                if (fetch_file_list[i][0] != '/')
                        fetch_file_list[i] = "/" + fetch_file_list[i];
                send_command(vfd, "get " + fetch_file_list[i]);
        }

        send_command(vfd, "close");
}

// 比较版本中所有的文件
private void syn_check_version_file()
{
        mapping store;
        string file;

        // 切换状态为同步状态
        client_info[STATUS] = STATUS_SYN;

        if (! mapp(store = query(FILES)))
        {
                // 没有版本信息
                log_file("version", sprintf("%s can not synchronize version "
                                            "without version's dbase.\n",
                                            log_time()));
                syn_finish();
                return;
        }

        // 确保没有本地的文件信息
        delete(STATS);

        // 检查所有的文件
        syn_load_version("/", store);

        // 构造所有额外文件的版本
        foreach (file in include_dir)
                syn_load_version(file, 0);

        // 保存版本
        send_command(vfd, "close");
        log_file("version", sprintf("%s total %d commands generated.\n",
                                    log_time(), sizeof(client_info[PENDING_WRITE])));
}

// 检查并获得某一个文件
// 如果服务器和本地都没有修改某个文件，则不需要同步，如果有
// 一方修改了，则需要同步。
// 如果服务器修改了，那么这里的参数ver和本地FILES中记录的版
// 本会有差别。如果是本地修改了， 那么本地STATS钟记录的版本
// 和本地的文件会有差别。
// 对于".c"文件来说，STATS 中记录的是二进制".b"文件的时间，
// 而不是".c"文件的时间，但是FILES 记录的却是".c"文件的时间，
// 这一点需要注意。为什么这么做？这是因为实际上本地修改了源
// 文件并不重要，只要二进制代码没有修改即可。服务器传来的 c
// 文件版本实际上是在服务器上的二进制文件的版本，这样上下不
// 就不一样了吗？的确是这样，因为在服务器上即使".c"文件没有
// 修改，".b"文件依然有可能变化，因此传送二进制文件的版本才
// 更有意义，这就是服务器和客户端不同之处。
void syn_load_file(string file, int ver)
{
        int len;
        mixed st;
        int ft, now_ft;

        switch (file_size(file))
        {
        case -2:
                // 有了这个名字的目录，删除之
                log_file("version", sprintf("%s remove directory: %s\n",
                                            log_time(), file));
                RM_CMD->rm_dir(file);
                break;
        case -1:
                break;
        default:
                // 没有这个文件或是有了重名的文件
                // 首先比较本地和服务器上的版本，如果不相同
                // 则需要更新。否则比较本地的版本信息和真实
                // 文件的信息，如果时间不相同，则也需要更新。
                st = stat(file);
                if (! arrayp(st) || sizeof(st) < 3)
                        ft = -1;
                else
                        ft = st[1];

                // 取本地文件的记录时间
                now_ft = query_temp(STATS + file);
                if (now_ft == ft && query_temp(FILES + file) == ver)
                {
                        // 和当前的版本一样，不需要更新
                        DEBUG_LOG(sprintf("file(%s) local = %d  ver = %d  stat = %d  ft = %d\n",
                                          file, query_temp(FILES + file), ver, query_temp(STATS + from), ft));
                        set(STATS + file, now_ft);
                        return;
                }

                break;
        }

        len = strlen(file) - 2;
        if (len > 0 && file[len] == '.' && file[len + 1] == 'c')
        {
                // 是源文件，先创建一个空的文件，一般来说服
                // 务器会返回一个二进制文件，除非是需要发布
                // 的源文件，服务器才会返回源代码。
                rm(file);
                write_file(file, "// C source file\n", 1);
        }

        // 读取这个文件的版本：如果是需要发布源程序的版本，
        // 那么服务器会返回一个源程序，否则服务器会返回一个
        // BINARY文件。
        syn_get_file(file);
}

STATIC_VAR_TAG int d = 0;

// 检查某一个路径
private void syn_load_version(string path, mapping store)
{
        mixed *dirs;
        string *files;
        string *outs;
        mixed rmfile;
        string full_name;
        string bin_name;
        string get_file;
        int ver;
        int len;

        if (mapp(query(FILES + path)))
                // 同步一个路径的版本
                ; else
        if (! undefinedp(ver = query(FILES + path)))
        {
                // 同步一个文件的版本
                syn_load_file(path, ver);
                return;
        } else
                // 没有这个文件，无需同步
                return;

        if (path[strlen(path) - 1] != '/') path += "/";

        sys_info(sprintf("check version: %s", path));

        // 获得本地路径的文件
        dirs = get_dir(path, -1);

        // 获得版本机上的所有文件
        files = keys(store);

        // 找出本地多余的文件和目录：条件，服务器传来的版本
        // 中没有，并且不属于本地不需要更新的路径
        outs = filter_array(dirs, (: undefinedp($(store)[((mixed *) $1)[0]]) &&
                                     member_array($(path) + ((mixed *) $1)[0], exclude_dir) == -1 :));

        // 删除这些文件和目录
        foreach (rmfile in outs)
        {
                reset_eval_cost();
                if (rmfile[1] == -2)
                {
                        // 这是一个目录
                        log_file("version", sprintf("%s remove directory: %s\n",
                                                    log_time(), path + rmfile[0]));

                        RM_CMD->rm_dir(path + rmfile[0]);
                } else
                {
                        // 这是一个普通文件，删除之
                        log_file("version", sprintf("%s remove file: %s\n",
                                                    log_time(), path + rmfile[0]));
                        // More to be added
                        len = strlen(rmfile[0]) - 2;
                        if (len > 0 && rmfile[0][len] == '.' &&
                            rmfile[0][len + 1] == 'c')
                        {
                                // 如果是c文件，同时删除bin文件
                                rm(bin_path + path + rmfile[0][0..len] + "b");
                        }

                        rm(path + rmfile[0]);
                }
                // 继续删除不相关的文件
        }

        // 读取需要更新的文件
        foreach (get_file in files)
        {
                reset_eval_cost();
                full_name = path + get_file;
                if (mapp(store[get_file]))
                {
                        // 这是一个路径，如果本地没有，就建立
                        switch (file_size(full_name))
                        {
                        case -2:
                                // 已经有了这个目录
                                break;

                        case -1:
                                // 没有这个目录和同名的文件
                                mkdir(full_name);
                                break;

                        default:
                                // 有这个名字的文件
                                rm(full_name);
                                mkdir(full_name);
                                break;
                        }

                        // 在binaries下面也建立一个路径 测试
                        bin_name = bin_path + full_name;
                        switch (file_size(bin_name))
                        {
                        case -2:
                                // BIN下面已经有了这个目录
                                break;

                        case -1:
                                // 没有这个目录或是文件
                                mkdir(bin_name);
                                break;

                        default:
                                // 有这个名字的文件
                                rm(bin_name);
                                mkdir(bin_name);
                        }

                        if (member_array(full_name, exclude_dir) == -1)
                                // 继续同步下一个目录的版本
                                syn_load_version(full_name, store[get_file]);
                } else
                {
                        // 这是一个普通文件
                        syn_load_file(full_name, store[get_file]);
                }
        }

        // 如果是额外需要更新的文件或是本目录属于不需更新一
        // 类，则保留这些文件。
        files = filter_array(files, (: member_array($(path) + $1, include_dir) != -1 ||
                                       member_array($(path), exclude_dir) :));
}

// 同步版本结束
// 结束时可能成功的同步了，也可能没有。
private void syn_finish()
{
        string op;

        sys_info(sprintf("同步结束：版本状态 = %d", version_ok));

        if (vfd) { socket_close(vfd); vfd = 0; }

        client_info[STATUS] = STATUS_FINISHED;
        client_info[FILE_NAME] = 0;
        client_info[FILE_POS] = 0;
        client_info[FILE_SIZE] = 0;
        client_info[PENDING_WRITE] = ({ });
        client_info[RESULT_BUFFER] = "";

        // 清除临时数据
        delete_temp(FILES);
        delete_temp(STATS);

        // 取operator
        op = query_temp("operator");
        delete_temp("operator");

        // 如果版本已经同步好了，就直接返回
        if (version_ok)
        {
                if (stringp(op)) return;

                // 这是系统自动同步的版本，需要重新启动机器
                if (query_temp("version_changed"))
                {
                        message_system("系统更新了版本，将于三十秒钟以后重新启动机器。\n");
                        call_out("syn_reboot_mud", 30);

                        // 重新设置版本为无效
                        version_ok = 0;
                }
                return;
        }

        // 如果是运行中同步，那么就设置版本号为零，表示需要
        // 继续同步；否则重新启动MUD。
        if (stringp(op))
        {
                set("version", 0);
                save();
                delete_temp("operator");
                sys_info(sprintf("%s同步版本的操作失败了，详情"
                                 "请查看日志(version)。", op));

                // 置现在的版本为有效
                version_ok = 1;
        } else
        {
                set("version", 0);
                save();
                // 一分钟以后重新启动MUD
                sys_info("同步版本失败，将于一分钟后重新启动MUD。");
                call_out("syn_reboot_mud", 60);
        }
}

// 同步失败，重新启动MUD
private void syn_reboot_mud()
{
        sys_info("版本精灵重新启动MUD。");
        shutdown(0);
}

// 处理客户端接收到的来自服务器的数据
private void syn_read_callback(int fd, buffer buf)
{
        string str;
        int len;
//      int ver;
//      string msg;

        if (fd != vfd || ! bufferp(buf)) return;

        DEBUG_LOG(sprintf(HIC "incoming: buf = %O(%d)\n" NOR, buf, sizeof(buf)));

        do
        {
                if (! client_info[FILE_NAME])
                {
                        // 没有文件名字，接收的是普通应答信息

                        // 计算我应该从缓冲区中读出的字节数目，因为
                        // 可能不能一次获得普通的应答信息，因此我将
                        // 这些信息累计到RESULT_BUFFER中， 一直到读
                        // 满期望的字节为止。那么我这次从缓冲区读出
                        // 来的应该是多少个字节，就应该计算。其中保
                        // 存在FILE_POS中的是我已经读出的字符。
                        len = NORMAL_RESULT_LEN - client_info[FILE_POS];
                        if (len > sizeof(buf))
                                // 这次没有这么多字节可以让我读
                                len = sizeof(buf);
                        client_info[FILE_POS] += len;
                        client_info[RESULT_BUFFER] += read_buffer(buf, 0, len);
                        // 取剩余的buffer
                        buf = buf[len..<1];

                        if (client_info[FILE_POS] >= NORMAL_RESULT_LEN)
                        {
                                // 读到了一条通常的返回信息，重新设
                                // 置缓冲区。
                                str = client_info[RESULT_BUFFER];
                                client_info[RESULT_BUFFER] = "";
                                client_info[FILE_POS] = 0;

                                // 处理接收到的结果信息
                                syn_receive_result(str);
                        }
                }

                DEBUG_LOG(sprintf("buf = %O(%d) ... file_name = %O(%d)\n",
                                                          buf, sizeof(buf),
                                                          client_info[FILE_NAME],
                                                          client_info[FILE_POS]));
                if (bufferp(buf) && client_info[FILE_NAME])
                        // 接收文件
                        buf = buf[syn_receive_file(buf)..<1];

                // 如果buf不为空，则继续处理
        } while (sizeof(buf) && client_info[STATUS] != STATUS_FINISHED);
}

// 同步时客户端连接的写回调函数
void syn_write_callback(int fd)
{
        if (fd != vfd)
        {
                log_file("version", sprintf("socket error: fd = %d vfd = %d\n", fd, vfd));
                return;
        }

        while (sizeof(client_info[PENDING_WRITE]))
        {
                // 有阻塞的消息，发送之
                if (send_client_pending_msg() != 0)
                        // 没有成功的发送，等待下一次发送
                        return;
        }

        // 根据当前的状态处理
        switch (client_info[STATUS])
        {
        case STATUS_CONNECTING:
                if (fetch_file_list)
                {
                        // 指定获得某些文件
                        syn_fetch_file_from_server();
                        break;
                }

                // 刚刚连接，发送取版本的命令
                send_command(fd, "getver");
                client_info[STATUS] = STATUS_GET_VERSION;
                sys_info("版本精灵成功的和服务器建立了通讯。");
                break;
        }
}

// 同步时客户端连接断开的回调函数
private void syn_close_callback(int fd)
{
        if (fd != vfd) return;

        vfd = 0;
        if (version_ok) return;

        // 版本没有同步完全，TCP连接已经断开
        syn_finish();
        log_file("version", sprintf("%s TCP connection lost when synchronizing.\n",
                                    log_time()));
        DEBUG_LOG(HIG "TCP disconnected.\n" NOR);
}

// 系统信息
private void sys_info(string msg)
{
        CHANNEL_D->do_channel(this_object(), "sys", msg);
}

// 调试信息
private void debug_info(string msg)
{
        CHANNEL_D->do_channel(this_object(), "debug", msg);
}

// 版本发布站监听来自分站的请求
private void in_listen_callback(int fd)
{
	int new_fd;
        string address;
        string ip;
        int port;

	if ((new_fd = socket_accept(fd, "in_read_callback",
                                        "in_write_callback")) < 0)
                // 没有成功的接收这个连接请求
		return;

        address = socket_address(new_fd);
        if (! stringp(address) || sscanf(address, "%s %d", ip, port) != 2 ||
              member_array(ip, AGENT_IP) == -1)
        {
                // 这个地址没有经过授权
                socket_close(new_fd);
                return;
        }

        sys_info(sprintf("站点 %s 连接版本开始同步版本。", ip));

        socket_info[new_fd] = allocate(7);
	socket_info[new_fd][STATUS] = STATUS_LOGIN;
        socket_info[new_fd][CMD_BUFFER] = "";
        socket_info[new_fd][CMD_QUEUE] = ({ });
        socket_info[new_fd][PENDING_WRITE] = ({ });

        // 更新状态
        socket_info[new_fd][STATUS] = STATUS_WAIT_COMMAND;
	in_write_callback(new_fd);
}

// 接受信息
private void in_read_callback(int fd, mixed mess)
{
        int cc;
	string *cmds;
        mixed  prefix;
        string str;

	if (! arrayp(socket_info[fd]))
                return;

        if (stringp(mess))
                // 接收到了字符串
                str = mess;
        else
        if (bufferp(mess))
                // 接收到了缓冲区
                str = read_buffer(mess, 0, sizeof(mess));
        else
                return;

        if (! str) return;

	str = replace_string( str, "\r", "");
        if (stringp(prefix = socket_info[fd][CMD_BUFFER]))
                str = (string) prefix + str + "\n";
        else
                str += "\n";

	cmds = explode(str, "\n");
        socket_info[fd][CMD_BUFFER] = cmds[sizeof(cmds) - 1];

        if (sizeof(cmds) > 1)
        {
                // 将这些命令放入到命令队列中
                cc = sizeof(socket_info[fd][CMD_QUEUE]);
                socket_info[fd][CMD_QUEUE] += cmds[0..<2];
                if (socket_info[fd][STATUS] == STATUS_WAIT_COMMAND)
                        // 正在接受命令状态
                        parse_cmd(fd);
        }
}

// 成功写入
private void in_write_callback(int fd)
{
        buffer buf;
        int pos, len;
        int i;

        for (i = 0; i < 32; i++)
        {
                // 循环处理消息
                reset_eval_cost();

                // 已经处理完了？
        	if (! arrayp(socket_info[fd]))
                        // 是，这个不需要继续处理了
                        return;

                // 如果有阻塞的普通消息，则我发送出去
                while (sizeof(socket_info[fd][PENDING_WRITE]))
                {
                        // 有阻塞的消息，发送之
                        if (send_pending_msg(fd) != 0)
                                // 没有成功的发送，等待下一次发送
                                return;
                }

                // 根据当前的状态进行进一步处理
                switch (socket_info[fd][STATUS])
                {
                case STATUS_SENDING:
                        // 正在发送文件
                        pos = socket_info[fd][FILE_POS];
                        len = socket_info[fd][FILE_SIZE] - pos;
                        if (len > FILE_BLOCK)
                                len = FILE_BLOCK;
                        if (len > 0)
                        {
                                buf = read_buffer((string) socket_info[fd][FILE_NAME], pos, len);
                                if (sizeof(buf) != len)
                                        // 读取没有完全成功？填写零发送。
                                        buf = allocate_buffer(len);
                                // 判断这次操作的结果
                                switch (socket_write(fd, buf))
                                {
                                case EESUCCESS:
                                        // 移动游标
                                        pos += len;
                                        break;

                                case EECALLBACK:
                                        // 移动游标
                                        pos += len;

                                        // 等待CALLBACK，先不继续处理
                                        socket_info[fd][FILE_POS] = pos;
                                        return;

                                case EEWOULDBLOCK:
                                        // 发送忙
                                        call_out("in_write_callback", 2, fd);
                                        return;

                                default:
                                        // 发送失败，等待下次callback
                                        return;
                                }
                        }

                        // 判断文件是否发送完毕
                        if ((socket_info[fd][FILE_POS] = pos) >=
                            socket_info[fd][FILE_SIZE])
                        {
                                // 文件已经发送完毕，更新状态
                                socket_info[fd][STATUS] = STATUS_WAIT_COMMAND;
                                if (! sizeof(socket_info[fd][CMD_QUEUE]))
                                        // 已经没有待处理的命令了
                                        return;

                                // 继续处理命令：为什么要用
                                // this_object() 进行呼叫？
                                // 这个是不能省略的，因为这
                                // 样其它部分的函数就可以根
                                // 据previous_object() 分辨
                                // 是否试运行在callback内。
                                this_object()->parse_cmd(fd);

                                // 继续，循环将会处理命令产生的结果
                        }

                        // 发送处理完毕
                        break;

                default:
                        // 未定义状态，无操作
                        return;
                }

                // 一次处理(switch)完毕，循环继续处理
        }

        // 运行太久了
        debug_info("向 SOCKET 写入数据太多，暂缓。");
        call_out("in_write_callback", 1, fd);
}

// 连接断开
private void in_close_callback(int fd)
{
        string address;

        address = socket_address(fd);
        if (stringp(address))
                sscanf(address, "%s %*d", address);
        else
                address = "unknow";

        sys_info(sprintf("站点 %s 和本站断开了连接。", address));

        // 清除信息
        map_delete(socket_info, fd);
}

// 分析命令
// 现在仅支持三条命令：
// 1. getver [dbase]
// 2. get <file>
// 3. close
// 由于命令简单，不采用常规的语法分析。
private void parse_cmd(int fd)
{
        string cmd;
        string word, arg;

        // 取出一条命令进行处理
        cmd = socket_info[fd][CMD_QUEUE][0];
        socket_info[fd][CMD_QUEUE] = socket_info[fd][CMD_QUEUE][1..<1];

        if (sscanf(cmd, "%s %s", word, arg) != 2)
        {
                word = cmd;
                arg = 0;
        }

        switch (word)
        {
        case "getver":
                cmd_getver(fd, arg);
                break;

        case "get":
                cmd_get(fd, arg);
                break;

        case "close":
                cmd_close(fd, arg);
                break;
        }
}

// 读取版本数据
private void cmd_getver(int fd, string arg)
{
        if (arrayp(total_build))
        {
                // 现在版本正在构造中
                send_error_msg(fd, "generating version now.\n");
                return;
        }

        if (arg != "dbase")
        {
                // 发送版本号
                send_version(fd);
                return;
        }

        // 发送文件
        send_file(fd, query_save_file() + __SAVE_EXTENSION__, "dbase");
}

// 读取某一个文件
private void cmd_get(int fd, string arg)
{
//      string ban;
        int last;

        // 查看文件
        if (! arg || arg[0] != '/')
        {
                send_error_msg(fd, sprintf("no such file(%O).\n", arg));
                return;
        }

        last = strlen(arg) - 2;
        if (last >= 0 && arg[last] == '.' && arg[last + 1] == 'c')
        {
                // C文件，察看是否是需要发布版本的，如果不是，
                // 则返回BIN文件。
                if (! is_need_release_source(arg))
                        arg = bin_path + arg[0..last] + "b";
        }

        // 发送版本记录下的文件
        send_file(fd, VERSION_DIR + arg, arg);
}

// 关闭连接
private void cmd_close(int fd, string arg)
{
        string address;

        address = socket_address(fd);
        if (stringp(address))
                sscanf(address, "%s %*d", address);
        else
                address = "unknow";

        sys_info(sprintf("站点 %s 和本站同步完毕。", address));

        send_result(fd, RESULT_FINISH "ok\n");
}

// 向对方发送一个文件
private void send_file(int fd, string file, string peer_name)
{
        int fs;

        // 直接发送
        if ((fs = file_size(file)) < 0)
        {
                send_error_msg(fd, sprintf("read file(%s) error.\n", file));
                return;
        }

        // 更新状态，然后首先发送文件的长度
        socket_info[fd][FILE_NAME] = file;
        socket_info[fd][FILE_SIZE] = fs;
        socket_info[fd][FILE_POS] = 0;
        socket_info[fd][STATUS] = STATUS_SENDING;
        if (send_result(fd, sprintf(RESULT_FILE "%s %d\n", peer_name, fs)) == 0 &&
            previous_object() != this_object())
                // 成功发送了的应答，并且当前不是由in_write_callback
                // 调用进入，则继续发送文件
                in_write_callback(fd);
}

// 发送阻塞的消息
private int send_pending_msg(int fd)
{
        string result;

        result = socket_info[fd][PENDING_WRITE][0];

        switch (socket_write(fd, result))
        {
        case EESUCCESS:
                // 发送成功了
                socket_info[fd][PENDING_WRITE] = socket_info[fd][PENDING_WRITE][1..<1];
                return 0;

        case EECALLBACK:
                // 需要等待
                socket_info[fd][PENDING_WRITE] = socket_info[fd][PENDING_WRITE][1..<1];
                return -1;

        case EEWOULDBLOCK:
                // 发送数据阻塞
                call_out("in_write_callback", 2, fd);
                return -1;

        default:
        }
}

// 向对方发送一条结果信息
private int send_result(int fd, string msg)
{
        string result;

        result = sprintf("%-" + (NORMAL_RESULT_LEN - 1) + "s.", msg);

        if (sizeof(socket_info[fd][PENDING_WRITE]))
        {
                // 已经有阻塞需要发送的数据了，这次发送的数
                // 据先阻塞
                socket_info[fd][PENDING_WRITE] += ({ result });
                return -1;
        }

        switch (socket_write(fd, result))
        {
        case EESUCCESS:
                // 发送成功了
                return 0;

        case EECALLBACK:
                // 需要等待
                // socket_info[fd][PENDING_WRITE] += ({ result });
                return -1;

        case EEWOULDBLOCK:
                // 发送数据阻塞
                socket_info[fd][PENDING_WRITE] += ({ result });
                call_out("in_write_callback", 2, fd);
                return -1;

        default:
                socket_close(fd);
        }
}

// 向对方发送一条错误信息
private int send_error_msg(int fd, string msg)
{
        return send_result(fd, RESULT_ERR + msg);
}

// 向某一个接入请求发送版本号
private void send_version(int fd)
{
        int ver;
//      string msg;

        if (! intp(ver = query("version")) || ! ver)
        {
                // 还没有版本？
                send_result(fd, RESULT_NO_VERSION "no version");
                remove_connection(fd);
                return;
        }

        send_result(fd, sprintf(RESULT_VERSION "%d\n", ver));
}

// 去掉一个连接信息
private void remove_connection(int fd)
{
        map_delete(socket_info, fd);
        socket_close(fd);
}

// 为一个文件增加保证完整的鉴别ID
int append_sn(string file)
{
        string ckey;
        string text;
        int len;

        switch (file_valid(file))
        {
        case 0:
                // 目前的鉴别 ID 是错误的
                text = read_file(file);
                len = strsrch(text, "\n");
                text = text[len + 1..<1];
                write_file(file, text, 1);

                // 删除鉴别ID以后继续向下执行

        case -2:
                // 目前没有鉴别ID
                ckey = file_crypt(file);
                text = read_file(file);
                text = sprintf("// SN:%s\n%s", ckey, text);
                write_file(file, text, 1);
                return 1;

        case -1:
                // 没有这个文件
                return -1;

        default:
                // 已经有了正确的鉴别ID
                return 1;
        }
}
