// updatei.c
// by Doing

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string file;
        string *opts;
        int opt_compile;
        int opt_detail;
        int opt_force;

        object env;
        object ob;
        object *obs;
        string *base;
        string *temp;
        int i;
        int k;
        int level;
        int count;

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

	seteuid(geteuid(me));

	if (! arg)
   		return notify_fail("你必须指明想编辑的继承的根档案路径名。\n");

        file = 0;
        opt_compile = 0;
        opt_detail = 0;
        opt_force = 0;
        opts = explode(arg, " ");
        for (i = 0; i < sizeof(opts); i++)
        {
                switch(opts[i])
                {
                case "-c":
                        opt_compile = 1;
                        break;

                case "-d":
                        opt_detail = 1;
                        break;

                case "-f":
                        opt_force = 1;
                        break;

                default:
                        file = resolve_path(me->query("cwd"), opts[i]);
                }
        }

        if (! sscanf(file, "%*s.c")) file += ".c"; 
        if (file_size(file) < 0)
        	return notify_fail("没有 " + file + " 这个档案。\n");
	me->set("cwf", file);

        obs = filter_array(objects(), (: inherits($(file), $1) &&
                                         ! userp($1) &&
                                         ! playerp($1) &&
                                         ! clonep($1) :));
        obs -= ({ find_object(VOID_OB), find_object(TEMP_OB) });
        if (sizeof(obs) > 1024 && ! opt_force)
        {
                write("一共有 " + sizeof(obs) + " 个物件牵涉"
                      "在内，如果你决定编译，请指明-f参数。\n");
        }

        if (sizeof(obs) > 100 && opt_compile)
	        message_system("重新编译所有继承档案，请稍候...");

        base = ({ file });
        count = 0;
        level = 0;

        while (sizeof(base))
        {
                if (! level)
                        write(HIG "编译根文件：" + file + "，总共 " +
                              sizeof(obs) + " 个继承文件。\n" NOR);
                else
                        write(sprintf(WHT "编译第 %d 次继承的 %d 个"
                                      "文件，还剩 %d 个文件。\n" NOR,
                                      level, sizeof(base), sizeof(obs)));
                temp = ({ });
                for (i = 0; i < sizeof(base); i++)
                {
                        reset_eval_cost();
                        if (opt_compile)
                        {
                                object *moves;

                                if (opt_detail) write("编译" + base[i] + ":");

                                moves = 0;
                                if (ob = find_object(base[i]))
                                {
                                        // if a player in this room, I should move all
                                        // the objects out.
                                        if (sizeof(filter_array(deep_inventory(ob),
                                                                (: userp($1) || playerp($1) :))) > 0)
                                        {
                                                moves = all_inventory(ob);
                                                moves->move(VOID_OB, 1);
                                        }
                                        env = environment(ob);
                                        destruct(ob);
                                } else
                                {
                                        // no object, so no environment
                                        env = 0;
                                }
                
                                if (catch(ob = load_object(base[i])))
                                {
                                        write(HIR "\n编译遇到错误中止。\n" NOR);
                                        return 1;
                                }

                                // compiled successfully, I should move the
                                // objects in void back, if I has been move them
                                // out from old object.
                                if (objectp(ob) && arrayp(moves))
                                        moves->move(ob, 1);

                                if (opt_detail) write("成功！\n");

                                // if the old object has environment, I should
                                // replace this object in the environment.
                                if (environment(ob) != env && env)
                                        ob->move(env);
                        } else
                        {
                                if (opt_detail)
                                        write("需要编译" + base[i] + "。\n");
                        }
                        count++;
        
                        for (k = 0; k < sizeof(obs); k++)
                        {
                                if (member_array(base[i], inherit_list(obs[k])) != -1)
                                {
                                        temp += ({ base_name(obs[k]) + ".c" });
                                        obs[k] = 0;
                                }
                        }
                        obs -= ({ 0 });
                }

                level++;
                base = temp;
        }

        if (count > 0)
                write(HIC "总共有" + HIW + count + HIC "个档案" +
                      (opt_compile ? "被成功编译！\n" NOR : "需要编译。\n" NOR));
        else
                write(HIC "没有编译任何档案需要编译。\n" NOR);

        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : updatei <档案名> [-c] [-d] [-f]
 
这个指令可以更新某个档案和所有继承该档案的物件，不过那些复制
出来的物件不会更新。比如你编译了/feature/message，则继承该文
件的/inherit/char/char和间接继承的/inherit/char/npc 都会被重
新编译。如果一个物件是玩家对象，则不会被编译。

如果不指明参数-c，则系统只是列出需要编译那些档案。如果指明了
参数-d，则采用详细模式列出所有需要编译的档案。如果指明了-f则
编译所有对象，否则超过了1024个文件系统就不会进行编译。
HELP );
    return 1;
}
