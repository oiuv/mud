#include <ansi.h>

inherit KNOWER;
inherit F_VENDOR;

string ask_me();

void create()
{
        set_name("小贩", ({ "xiao fan", "xiao", "fan" }));
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性" );
        set("age", 32);
        set("long", "这是个小贩，别看他长的老老实实，可你别\n"
                    "想从他那儿掏便宜。\n");
        set("combat_exp", 300);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "friendly");
        set("vendor_goods", ({
                __DIR__"obj/stick",
                __DIR__"obj/bottle",
                __DIR__"obj/egg",
                "/d/xingxiu/obj/fire",
        }));
        set("inquiry", ([
                "药材"   : (: ask_me :),
                "首乌"   : (: ask_me :),
                "何首乌" : (: ask_me :),
        ]));

        set("count", 3);

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("coin", 100);
}

void init()
{
        ::init();
        add_action("do_list","list");
        add_action("do_buy", "buy");
}

string ask_me()
{
        object me = this_player();

        if (query("count") < 1)
	{
                return "实在对不住，现在我手里也没货了。\n";
        } else
        if (me->query_temp("tmark/药"))
	{
                return "我走南闯北，没见过你这么罗嗦的人。\n";
        } else
	{
                me->set_temp("tmark/药", 1);
                return "我到极北森林中采药，还真遇到了一些好药材，要买得先交钱。\n";
        }
}

int accept_object(object who, object ob)
{
        object obj;

        if (! ob->query("money_id"))
	{
                write(CYN "小贩诧异地说道：你给我这个干什么？\n" NOR);
                return 0;
	}

        if (query("count") < 1)
	{
                write(CYN "小贩抱歉地说道：实在对不住，现在我手里也没货了？\n" NOR);
                return 0;
	}

        if (! who->query_temp("tmark/药"))
	{
                write(CYN "小贩疑惑地说道：我又不是乞丐，你没事给我钱干嘛？\n" NOR);
                return 0;
	}

        if (ob->value() < 10000)
	{
                write(CYN "小贩阴笑着说道：嘿嘿，给我这么多钱哪。\n" NOR);
                return 0;
	}

        obj = new(__DIR__"obj/shouwu");
        obj->move(this_object());

        add("count", -1);
        command("give he shouwu to " + who->query("id"));
        write(CYN "小贩说道：既然您出得起价钱，这味药可就归您了。\n" NOR);
        return 1;
}
