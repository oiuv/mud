// dbased.c 永久记忆的数据库(可以记录所有的场景和物品)
// 数据库中的路径以dbase为根、文件路径为途径。
// 比如/d/city/kedian这个对象保存在数据库中的将是：
// /dbase/d/city/kedian，保存的内容是一个mixed类型，当对象的
// restore函数被调用的时候，对象必须保证有receive_dbase_data
// 函数用来接收保存在数据库中的数据。 当对象保存的时候，则必
// 须有save_dbase_data函数返回需要保存的数据。

#include <ansi.h>

// #pragma optimize
// #pragma save_binary

inherit F_SAVE;
inherit F_DBASE;

// 保存数据的映射变量
mapping save_dbase;

// 调用函数announec_all_save_object时候的标志
#define ONLY_SAVE               0
#define DESTRUCT_OBJECT         1
STATIC_VAR_TAG  int save_flag = ONLY_SAVE;

// 内部调用的函数
STATIC_FUNC_TAG int announce_all_save_object(int destruct_flag);

// 提供给外部的函数
mixed   query_data();
int     set_data(mixed data);
mixed   query_object_data(object ob);
int     set_object_data(object ob, mixed data);
mapping query_save_dbase();
string *query_saved_object();
int     clear_object(mixed ob);
int     remove(string euid);
void    mud_shutdown();

void create()
{
        if (! restore() && ! mapp(save_dbase))
                save_dbase = ([]);

        // auto save per 15 minute (900s)
        set_heart_beat(900 + random(20)); // modify by rcwiz
}

// 数据库对象析构函数
int remove(string euid)
{
        if (previous_object() != find_object(SIMUL_EFUN_OB) ||
            ! is_root(euid))
        {
                // Must be called from simul_efun object
                return 0;
        }

        announce_all_save_object(save_flag);
        return 1;
}

// MUD将要停止运行
void mud_shutdown()
{
        announce_all_save_object(ONLY_SAVE);	//added by Ivy
        save_flag = DESTRUCT_OBJECT;
        destruct(this_object());
}

// 通知所有的需要保存数据的对象
STATIC_FUNC_TAG int announce_all_save_object(int destruct_flag)
{
        object ob;
        string *e;
        int i;

        if (mapp(save_dbase))
                e = keys(save_dbase);
        else
                e = ({ });
        // 通知所有的存盘对象保存数据
        for (i = 0; i < sizeof(e); i++)
        {
                if (! stringp(e[i]))
                        // 不应该不是字符串
                        map_delete(save_dbase, e[i]);
                else
                if (objectp(ob = find_object(e[i])))
                {
                        // 找到了存盘的对象，通知它们
                        if (destruct_flag == DESTRUCT_OBJECT)
                                catch(destruct(ob));
                        else
                                catch(ob->save());
                }
        }

        save();
        return 1;
}

// 清理所有对象
int cleanup_all_save_object(int raw)
{
//      object ob;
        string *e;
        int i;

        if (mapp(save_dbase))
                e = keys(save_dbase);
        else
                return 1;

        // 通知所有的存盘对象保存数据
        for (i = 0; i < sizeof(e); i++)
        {
                if (! stringp(e[i]))
                        // 不应该不是字符串
                        map_delete(save_dbase, e[i]);
                else
                if (file_size(e[i] + ".c") < 0)
                {
                        log_file("dbase", sprintf("data of (%s) cleaned because no found object.\n",
                                                  e[i]));
                        if (raw) map_delete(save_dbase, e[i]);
                }
        }

        save();
        return 1;
}

// 心跳函数，自动保存所有的数据
STATIC_FUNC_TAG int heart_beat()
{
        set_heart_beat(900 + random(20));
        announce_all_save_object(ONLY_SAVE);
}

string query_save_file() { return DATA_DIR + "dbased"; }

// 某个物件读取自己的记录
mixed query_data()
{
        return query_object_data(previous_object());
}

// 某个物件保存自己的记录
int set_data(mixed data)
{
        return set_object_data(previous_object(), data);
}

// 读取某个对象的记录
mixed query_object_data(mixed ob)
{
        string index;

        if (! ob) return 0;

        // 只有ROOT或对象自己才可以保存或读取数据
        if (! is_root(previous_object()) &&
            previous_object() != ob) return 0;

        if (stringp(ob))
        {
                index = ob;
                sscanf(index, "%s.c", index);
        } else
        if (objectp(ob))
                index = base_name(ob);
        else
                return 0;

        return save_dbase[index];
}

// 保存某个对象的记录
int set_object_data(mixed ob, mixed data)
{
        string index;

        if (! ob) return 0;

        // 只有ROOT或对象自己才可以保存或读取数据
        if (! is_root(previous_object()) &&
            previous_object() != ob) return 0;

        if (stringp(ob))
        {
                index = ob;
                sscanf(index, "%s.c", index);
        } else
        if (objectp(ob))
                index = base_name(ob);
        else
                return 0;

        if (! data)
        {
                map_delete(save_dbase, index);
                return 1;
        }

        save_dbase[index] = data;
        return 1;
}

// 读取所有对象的记录
mapping query_save_dbase()
{
        return save_dbase;
}

// 查阅保存了数据的所有对象
string *query_saved_object()
{
        return keys(save_dbase);
}

// 清除一个对象
int clear_object(mixed ob)
{
        string index;
        object xob;

        // 由于一个对象在清除前一般会保存自己的数据，所以一旦数据受到
        // 损伤需要恢复对象为原始状态的时候就必须先清除对象本身，然后
        // 清空它的数据。

        if (! ob) return 0;

        if (stringp(ob))
        {
                index = ob;
                sscanf(index, "%s.c", index);
                xob = find_object(index);
        } else
        if (objectp(ob))
        {
                xob = ob;
                index = base_name(xob);
        } else return 0;

        if (! is_root(previous_object()) &&
            previous_object() != xob) return 0;

        if (xob) destruct(xob);
        map_delete(save_dbase, index);
        return 1;
}