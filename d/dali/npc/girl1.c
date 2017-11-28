// girl1.c

inherit NPC;

void create()
{
	set_name("南国姑娘",({ "girl" }) );
        set("gender", "女性" );
        set("age", 22);
        set("long", "南国的大姑娘颇带有当地优美秀丽山水的风韵，甜甜的笑，又有
天真的浪漫。她穿着白色上衣，蓝色的宽裤，外面套着黑丝绒领褂，
头上缠着彩色的头巾。\n");
 	set_temp("apply/defense", 15);
	set("combat_exp", 2000);
	set("shen_type", 1);
        set("per", 25);
        set("str", 24);
        set("dex", 25);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/whitecloth1")->wear();
}

