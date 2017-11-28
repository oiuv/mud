// chuanfu.c 船夫

#include <ansi.h>

inherit KNOWER;

void create()
{
        set_name("船夫", ({ "chuan fu" }));
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性");
        set("age", 56);
        set("long", @LONG
这是一个船夫。懒洋洋的靠在岸边，打量着来往的行人。眼神中透露
出一股狡黠之气。
LONG );

        set("combat_exp", 300000);

	set("eff_qi", 2000);
	set("qi", 2000);
        set("max_neili", 1000);
        set("neili", 2000);
        set("jiali", 50);

        set_skill("force", 100);
        set_skill("unarmed", 100);
        set_skill("dodge", 100);
        set_skill("parry", 100);
        set("inquiry", ([
                "出海" : "那儿不是有船么？别来烦我。",
        ]));

        setup();
	carry_object("/clone/misc/cloth")->wear();
}

void unconcious()
{
        ::die();
}
