// guilei.c
// by Smallfish

#include <ansi.h>

inherit F_CLEAN_UP;

int guilei_dir(object me, string dir, string type, int continueable, int *total);
int guilei_file(object me, string file, string type);
STATIC_VAR_TAG int all_num;	//判断多少文件给归类

int main(object me, string arg)
{
        string dir,type,type_name;
        int continueable;
        int *total = ({0});

        seteuid(geteuid(me));

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

        write("文件归类。");

        continueable = 1;
 	if (!arg || !(sscanf(arg,"%s %s",dir,type) == 2)) 
                return notify_fail("格式：guilei <路径> room|npc \n");

       	dir = resolve_path(me->query("cwd"), dir);

        if (dir[strlen(dir) - 1] != '/')
                dir += "/";

	if (file_size(dir) != -2)
		return notify_fail("没有" + dir + "这个路径。\n");

        //归类类型
        switch(type)
        {
                case "room":
                        type_name = "房间";
                        break;
                case "npc":
                        type_name = "NPC";
                        break;
                case "obj":
                        type_name = "物品";
                        break;
                default:
                        return notify_fail("格式：guilei <路径> room|npc \n");
        }

	me->set("cwd", dir);

	message_system("整理归类" + type_name + "档案中，请稍候...");
        if (! guilei_dir(me, dir, type, continueable, total))
        {
                write(HIR "归类遇到错误中止。\n" NOR);
        }

        if (total[0] > 0)
        {
                write(HIC "总共有" + HIW + total[0] + HIC "个档案被成功归类！\n" NOR);
                write(HIC "归类信息存放在" + HIW + "/log/static/" + type + HIC "之中！\n" NOR);
        } else
                write(HIC "没有归类任何档案。\n" NOR);

        return 1;
}

int guilei_dir(object me, string dir, string type, int continueable, int *total)
{
	int i;
        int l;
        int filecount, compcount;
        mixed *file;
        string filename;

        if (! is_root(previous_object()))
                return 0;

	file = get_dir(dir, -1);
	if (! sizeof(file))
	{
                if (file_size(dir) == -2)
                        write(dir + "这个目录是空的。\n");
		else
		        write("没有" + dir + "这个目录。\n");
                return 1;
	}

        write (HIY "开始检查目录" + dir + "下面的所有文件。\n" NOR);
	i = sizeof(file);
        compcount = 0;
        filecount = 0;
        all_num = 0;
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] != -2)
                {
                        filecount++;
                        filename = file[i][0];
                        l = strlen(filename);
                        if (filename[l - 1] != 'c' || filename[l - 2] != '.')
                                continue;

                        if (! guilei_file(me, dir + filename, type) &&
                            ! continueable)
                                return 0;

                        compcount++;
                        total[0]++;
                        if ((compcount % 70) == 0)
                                write("\n");
                }

                // continue to compile next file
	}
        write(HIC "\n整理了目录" + dir + "下的" + HIW + filecount + HIC +
              "个文件。\n检查了其中" + HIW + compcount + HIC + 
              "个档案。\n归类了其中" + HIW + all_num + HIC + "个档案。\n" + NOR );

	i = sizeof(file);
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] == -2)
                {
                        file[i][0] += "/";
                        write("\n");
                        if (! guilei_dir(me, dir + file[i][0], type, continueable, total) &&
                            ! continueable)
                                return 0;
                }
        }
	return 1;
}

int guilei_file(object me, string file, string type)
{
        string document;
        mapping all_obj;
        string *ob_list,the_id,the_name,the_object,file_name;
        int i,is_ok;
        object obj,*inv;

        if (file == "/cmds/adm/guilei.c")
                // 不自我读本指令文件
                return 1;

        write (".");
        
        //归类房间文件
        if (type == "room")
        {
                document = read_file(file);
                if (! document) return 0;
                is_ok = strsrch(document, "inherit ROOM", 1);
                
                if (is_ok >= 0)
                {
                        all_num ++;
                        file_name = file->query("short");
                        all_obj = file->query("objects");
/*
                        if (! mapp(all_obj))
                        {
                                file->set("objects", ([
                	                "/u/ivy/no_npc" : 1,
                                ]));
                        }
*/
                        if (! mapp(all_obj))
                                return 0;

                        ob_list = keys(all_obj);

                        for (i = 0; i < sizeof(ob_list); i++)
                        {
                                reset_eval_cost();
                                the_object = ob_list[i] + ".c";
                                the_name = the_object->name(1);
                                the_id = the_object->query("id");
                                log_file("static/room", sprintf("%s|%s|%s|%s|%s\n",
                                        file, 
                                        file_name, 
                                        the_object, 
                                        the_name, 
                                        the_id,
                                ));
                        }
                }
        }

        //归类NPC文件
        if (type == "npc"){
                document = read_file(file);
                if (!document) return 0;
                is_ok = strsrch(document,"inherit NPC",1);
                
                if (is_ok > 0) {
                        all_num ++;
                        obj = new(file);
                        if (!obj) return 0;
                        log_file("static/npc", sprintf("%s|%s|%s|%d|%d|%d|%d|%d|%d|%d|%d|%d|%d|%s|%s|%s\n",
                                file,
                                obj->query("id"),
                                obj->query("name"),
                                obj->query("combat_exp"),
                                obj->query("jing"),
                                obj->query("eff_jing"),
                                obj->query("qi"),
                                obj->query("eff_qi"),
                                obj->query("jingli"),
                                obj->query("max_jingli"),
                                obj->query("neili"),
                                obj->query("max_neili"),
                                obj->query("shen"),
                                obj->query("gender"),
                                obj->query("race"),
                                obj->query("family/family_name")
                        ));

                        inv = all_inventory(obj);
                        if (sizeof(inv)) {
                                for (i = 0; i < sizeof(inv); i++)
                                {
                                        log_file("static/npc_obj", sprintf("%s|%s.c|%s|%s\n",
                                                file, 
                                                base_name(inv[i]),
                                                inv[i]->query("id"),
                                                inv[i]->name(1)
                                        ));
                                }
                        }

                        all_obj = obj->query("vendor_goods");
                        if (!mapp(all_obj)) return 0;
                        ob_list = keys(all_obj);
                        for (i = 0; i < sizeof(ob_list); i++) {
                                the_object = ob_list[i] + ".c";
                                log_file("static/npc_obj", sprintf("%s|%s|%s|%s\n",
                                        file, 
                                        the_object,
                                        the_object->query("id"), 
                                        the_object->name(1)
                                ));
                        }
                        destruct(obj);
                }
        }

        //归类物品文件
        if (type == "obj"){
                document = read_file(file);
                if (!document) return 0;
                is_ok = strsrch(document,"inherit NPC",1);
                if (is_ok > 0) return 0;
                is_ok = strsrch(document,"inherit ROOM",1);
                if (is_ok > 0) return 0;
                obj = new(file);
                if (!obj) return 0;
                all_num ++;
                log_file("static/obj", sprintf("%s|%s|%s|%d|%d\n",
                        file,
                        obj->query("id"),
                        obj->query("name"),
                        obj->query("value"),
                        obj->query_weight()
                ));
                destruct(obj);
        }
        return 1;
}

int help (object me)
{
        write(@HELP
指令格式: guilei <路径|文件名> <room|npc|obj>
 
这个指令让你指定对一个文件或者一个目录下的房间、人物、物品的
属性进行归类。
room参数表示归类房间文件，信息包括文件名、房间名、房间里的物
品文件名、物品中文名、物品英文名；
npc 参数表示归类人物文件，信息包括文件名、中文名、英文名、门
派ID、门派中文名、身上物品的文件名、物品ID、物品中文名、人物
的给项HP属性、人物的主要SCORE属性；
obj 参数表示归类物品文件，信息包括文件名、物品ID、物品中文名、
物品的价值等等；

归类信息存放在/log/static目录下。

HELP );
        return 1;
}
