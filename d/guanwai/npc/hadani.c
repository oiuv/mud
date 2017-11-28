// hadani.c

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("哈达尼", ({ "ha dani", "dani", "ha" }));
	set("gender", "男性" );
	set("age", 28);
	set("long",
		"这是一位年轻的小伙子，靠打造出售铁器为生。\n");
        set("title", "铁匠");
	set("combat_exp", 30000);
	set("attitude", "friendly");
	set_temp("apply/attack", 30);
	set_temp("apply/defense", 30);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 30);

	set("vendor_goods", ({
		"/d/guanwai/obj/saw",
		"/d/guanwai/obj/axe",
	}));

        set("inquiry", ([
                "钢锯" : "我这里有上好的钢锯，你要不要买一条？",
                "锯"   : "我这里有上好的钢锯，你要不要买一条？",
                "斧头" : "我这儿有，来一把吧。",
                "斧子" : "我这儿有，来一把吧。",
        ]));

	setup();
	carry_object("/clone/cloth/cuttonp")->wear();
}

void init()
{	
	add_action("do_buy", "buy");
	add_action("do_list", "list");
}
