#include <ansi.h>
#include <login.h>
#include <command.h>

inherit ROOM;

int is_chat_room() { return 1; }

int do_wash(string arg);
int do_born(string arg);

mapping born = ([
        "扬州人氏" : "/d/city/kedian",
        "欧阳世家" : ([ "born"      : "西域人氏",
                        "surname"   : "欧阳",
                        "startroom" : "/d/baituo/dating",
                     ]),
        "关外胡家" : ([ "born"      : "关外人氏",
                        "surname"   : "胡",
                        "startroom" : "/d/guanwai/xiaowu",
                     ]),
        "中原苗家" : ([ "born"      : "中原人氏",
                        "surname"   : "苗",
                        "startroom" : "/d/zhongzhou/miaojia_houting",
                     ]),
        "段氏皇族" : ([ "born"      : "大理人氏",
                        "surname"   : "段",
                        "startroom" : "/d/dali/wangfugate",
                     ]),
        "慕容世家" : ([ "born"      : "江南人氏",
                        "surname"   : "慕容",
                        "startroom" : "/d/yanziwu/cuixia",
                     ]),

]);

void create()
{
        int i, k;
        string desc;
        string *position;

        set("short", HIR "阎罗殿" NOR);
        set("long", HIR @LONG

                    阎         罗         殿

    阎罗殿内阴森恐怖，让人感觉到一阵阵刺骨的寒意，两旁列着牛头
马面，冥府狱卒，各个威严肃穆。十殿阎罗，尽皆在此，地藏王坐在大
堂之上，不怒自威，你的腿脚不禁都有些软了。大殿角落有一个石头砌
成的池子，池中潭水清澈却不见底，不知道它究竟有多深。水池的旁边
有一个牌子(paizi)，你也许应该仔细看看。


LONG NOR );
        set("no_fight", 1);
        set("item_desc", ([
                "paizi" : "投胎乃人生大事，切记不可草率！选好天赋(washto)之后，就去投胎吧(born <中文地名>)。\n"
        ]));

        set("objects", ([
                __DIR__"npc/dizangwang" : 1,
                "/d/death/npc/niutou" : 1,
        ]));

        set("no_say", "阎罗殿内阴森恐怖，你哪里敢乱说话？\n");

        desc = query("item_desc/paizi");
        position = keys(born);

        for (i = 0, k = 1; i < sizeof(position); i++)
        {
                if (! stringp(born[position[i]]))
                        continue;

                desc += sprintf("%2d. " HIG "%s" NOR "\n", k++, position[i]);
        }

        for (i = 0; i < sizeof(position); i++)
        {
                if (! mapp(born[position[i]]))
                        continue;

                desc += sprintf("%2d. " HIC "%s" NOR "\n", k++, position[i]);
        }
        set("item_desc/paizi", desc);

        setup();
}

void init()
{
        add_action("do_wash", "washto");
        //add_action("do_wash2", "washto");
        add_action("do_born", "born");
}



int do_wash(string arg)
{
        int tmpstr, tmpint, tmpcon, tmpdex;
        object me;
        mapping my;

        if (! objectp(me = this_player()) ||
            ! userp(me))
                return 1;

        if( !arg || sscanf(arg, "%d %d %d %d", tmpstr, tmpint, tmpcon,tmpdex)!=4 )
                return notify_fail("指令格式：washto <膂力> <悟性> <根骨> <身法>\n");
        if( tmpstr>30) return notify_fail("你所选择的膂力参数不能大于30。\n");
        if( tmpstr<13) return notify_fail("你所选择的膂力参数不能小于13。\n");
        if( tmpint>30) return notify_fail("你所选择的悟性参数不能大于30。\n");
        if( tmpint<13) return notify_fail("你所选择的悟性参数不能小于13。\n");
        if( tmpcon>30) return notify_fail("你所选择的根骨参数不能大于30。\n");
        if( tmpcon<13) return notify_fail("你所选择的根骨参数不能小于13。\n");
        if( tmpdex>30) return notify_fail("你所选择的身法参数不能大于30。\n");
        if( tmpdex<13) return notify_fail("你所选择的身法参数不能小于13。\n");
        if((tmpstr+tmpint+tmpcon+tmpdex)!=80) return notify_fail("你所选择的属性总和必须为80。\n");

        write(HIC "你跳入忘忧池，顿时被一股激流卷了进去。\n" NOR, me);

        my = me->query_entire_dbase();

        my["str"] = tmpstr;
        my["int"] = tmpint;
        my["con"] = tmpcon;
        my["dex"] = tmpdex;
        my["kar"] = 5 + random(26);
        my["per"] = 5 + random(26);

        write(HIC "只听“啪”的一声，你被湿漉漉的抛了出来。\n" NOR, me);
        write(sprintf(HIY "\n你选择的四项先天天赋分别是：\n"
                          "膂力：【 " HIG "%d" HIY " 】 "
                          "悟性：【 " HIG "%d" HIY " 】 "
                          "根骨：【 " HIG "%d" HIY " 】 "
                          "身法：【 " HIG "%d" HIY " 】\n"
			  "如果你满意，就去投胎(born)吧！方法如"HIR"<born 扬州人氏>\n\n" NOR,
                      tmpstr, tmpint, tmpcon, tmpdex));
        me->set_temp("washed", 1);

        return 1;
}

int do_born(string arg)
{
        object me;
        object obj;
        object item;
        mixed dest;
        string new_name;
        string msg;

        if (! objectp(me = this_player()) ||
            ! userp(me))
                return 1;

        if (! me->query_temp("washed"))
                return notify_fail("你先在忘忧池中选择好天赋(washto)再投胎也不迟啊！\n");

        if (arg && arg[0] < 160)
                return notify_fail("你必须输入中文地名，比如born 扬州人氏，或者是born 欧阳世家以避免投错胎。\n");

        new_name = 0;
        if (arg) sscanf(arg, "%s %s", arg, new_name);

        if (! arg || (! stringp(dest = born[arg]) && ! mapp(dest)))
        {
                message_vision(CYN "牛头恶狠狠的对$N" CYN
                               "说：你要干什么！投胎去哪里？\n" NOR, me);
                return 1;
        }

        if (mapp(dest) && stringp(dest["notice"]))
                return notify_fail(dest["notice"]);

        if (stringp(dest))
        {
                if (! objectp(obj = find_object(dest)))
                        obj = load_object(dest);
                me->set("startroom", dest);
                me->set("born", arg);
                me->set("born_family", "没有");
        } else
        {
                if (! objectp(obj = find_object(dest["startroom"])))
                        obj = load_object(dest["startroom"]);
                me->set("startroom", dest["startroom"]);
                me->set("born", dest["born"]);
                me->set("born_family", arg);

                if (new_name)
                {
                        if (! sscanf(new_name, dest["surname"] + "%*s"))
                                new_name = dest["surname"] + new_name;

                        if (strlen(new_name) > 8)
                                return notify_fail("你的名字太长了。\n");

                        if (strlen(new_name) < 4)
                                return notify_fail("你的名字太短了。\n");

                        if (! is_chinese(new_name))
                                return notify_fail("请你用中文起名字。\n");
                }

                if (me->query("surname") != dest["surname"])
                {
                        // 名字需要变化
                        if (! new_name) new_name = dest["surname"] + me->query("purename");
                        if (stringp(msg = NAME_D->invalid_new_name(new_name)))
                        {
                                write(msg);
                                write("你可以考虑在投入世家的时候重新选择名字：born <世家> <名字>\n");
                                return 1;
                        }
                        me->set("surname", dest["surname"]);
                        me->set("purename", new_name[strlen(dest["surname"])..<1]);
                }

                if (mapp(dest["family"]))
                {
                        me->set("family", dest["family"]);
                        me->assign_apprentice(dest["family"]["title"], 0);
                }
                me->set_name();
        }
        if (! objectp(obj))
        {
                message_vision(CYN "牛头一呆，搔搔头说道：怎么好像有问"
                               "题……\n" NOR, me);
                return 1;
        }

        message_vision(HIC "牛头飞起一脚，将$N" HIC "踢了出去。\n" NOR, me);

		foreach (item in all_inventory(me))
			if (! item->query("armor_type") && ! (item->query("id")=="heros book"))
			{
				if (item->is_character() || item->query("value"))
					item->move(environment(me));
				else
					destruct(item);
			}

        // 选择特殊技能
        UPDATE_D->born_player(me);

        me->move(obj);
        me->set("mud_age", 0);
        me->set("age", 14);
        me->save();
        HELP_CMD->main(me, "rules");
        message_vision("$N揉揉眼睛，迷惘的望着这个陌生的世界。\n", me);

        return 1;
}
