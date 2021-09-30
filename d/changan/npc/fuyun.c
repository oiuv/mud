// fuyun.c 浮云

#include <ansi.h>
#include <command.h>
#include <config.h>
#include <getconfig.h>

inherit NPC;

int do_answer();
int do_list();
int do_duihuan(string);

mapping convert_list = ([
    1:            ({"/clone/fam/gift/str3", 1000, 0}),
    2:            ({"/clone/fam/gift/int3", 1000, 0}),
    3:            ({"/clone/fam/gift/con3", 1000, 0}),
    4:            ({"/clone/fam/gift/dex3", 1000, 0}),
    5:            ({"/clone/fam/item/yanluo", 1000, 0}),
    6:            ({"/clone/fam/item/lihuo", 1000, 0}),
    7:            ({"/clone/fam/item/qiankun_stone", 1000, 0}),
    8:            ({"/clone/fam/max/tianshu2", 3000, 0}),
    9:            ({"/clone/fam/max/tianshu1", 5000, 0}),
    10:            ({"/clone/fam/obj/guo", 6666, 0}),
    11:            ({"/clone/fam/max/longjia", 8888, 0}),
    12:            ({"/clone/fam/max/xuanhuang", 8888, 0}),
    13:            ({"/clone/fam/item/bless_water", 9999, 0}),
    14:            ({"/d/item/obj/tiancs", 99999, 0}),
    15:            ({"/d/death/obj/qise", 99999, 0}),
    16:            ({"/d/death/obj/tianjing", 999999, 0}),
]);

void create()
{
    set_name("浮云", ({ "fu yun","fu", "yun" }));
    set("title", HIC"门贡商人"NOR);
  set("nickname", HIY "多多益善" NOR);
    set("gender", "男性");
    set("age", 60);
    set("str", 100);
    set("long", "一切都是浮云。\n");
    set_skill("unarmed", 50);
    set_skill("dodge", 50);
    set_skill("higgling", 500);
    set_temp("apply/damage", 15);

    set("combat_exp", 800000);
    set("attitude", "friendly");

        set("inquiry", ([
                "门贡" : (: do_answer :),
                "贡献" : (: do_answer :),
                "门派贡献" : (: do_answer :),
        ]));

    setup();
    set_max_encumbrance(100000000);
}

void init()
{
        add_action("do_duihuan", "duihuan");
        add_action("do_list", "list");
}

int do_answer()
{
        write(name() + "在你耳边轻声说道：门派奖励物品我这里都有，输入（list）查看！\n");
        return 1;
}

int do_list()
{
        int i,gx;
        object ob;

        write("浮云目前可以兑换（duihuan）以下物品：\n");
        write("==========================================\n");
        write("编号  门贡    物品\n");
        write("------------------------------------------\n");
        for(i = 1; i <= sizeof(convert_list); i++){
                ob = new(convert_list[i][0]);
                write(i + "  ");
                if(i < 1000) write(" ");
                if(i < 100) write(" ");
                if(i < 10) write(" ");
                gx = convert_list[i][1];
                write(gx + "  ");
                if(gx < 10000) write(" ");
                if(gx < 1000) write(" ");
                if(gx < 100) write(" ");
                write(" ");
                write(ob->name());
                write("\n");
        }
        write("==========================================\n");

        return 1;
}

int do_duihuan(string arg)
{
        int n, count, i, gx;
        object ob, me;
        string  name;

        if (!arg || sscanf(arg, "%d %d", n, count) != 2)
                return notify_fail(CYN "浮云微笑道：你要兑换什么东西？"
                                   "指令：duihuan <编号> <数量>\n" NOR);

        if (n > sizeof(convert_list))
                return notify_fail(CYN "浮云微笑道：输入（list）"
                                   "看清编号再来吧。\n" NOR);

        me = this_player();
        gx = convert_list[n][1] * count;

        if(me->query("gongxian") < gx)
                return notify_fail(CYN "浮云对你冷笑一声，没理你。\n" NOR);

        for(i=0; i<count; i++){
                ob = new(convert_list[n][0]);
                name = ob->name();
                ob->move(me, 1);
        }

        me->add("gongxian", -gx);

        write(CYN "浮云拿出一些" + name + CYN "给你，"
                                    "笑眯眯的说：欢迎下次光临。\n" NOR);
        return 1;
}

void unconcious()
{
        message_vision("\n$N哼哼两声，道：“什么情况……”\n",
                       this_object());
}

void die()
{
        message_vision("\n$N大叫一声，说：“我还会回来的……”\n",
                       this_object());
}
