#include <ansi.h>
inherit NPC;

int ask_pixie();

void create()
{
        set_name("林震南", ({ "lin zhennan", "lin", "zhennan" }));
        set("gender", "男性");
        set("age", 45);
        set("long", "他就是「福威镖局」的总镖头林震南。\n");
        set("title", HIY "福威镖局总镖头" NOR);
        set("combat_exp", 100000);
        set("shen_type", 1);

        set("max_qi", 800);
        set("max_neili", 1000);
        set("neili", 1000);
        set("jiali", 30);

        set_skill("force", 100);
        set_skill("sword", 100);
        set_skill("pixie-sword", 100);
        set_skill("unarmed", 100);
        set_skill("dodge", 100);
        set_skill("parry", 100);

        map_skill("parry", "pixie-sword");
        map_skill("sword", "pixie-sword");

        set("inquiry", ([
                "向阳老宅" : "那是我从前在福建时住的家院，已经破败了。\n",
                "福威镖局" : "福威镖局开创初期，便是仗着先祖远图公当年闯下的威名。\n",
                "远图公"   : "祖父以七十二路辟邪剑法开创镖局，当真打遍黑道无敌手。\n",
                "林远图"   : "小孩子这么没礼貌，直呼先人名讳！\n",
                "辟邪剑法" : (: ask_pixie :),
        ]) );

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 15);

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

int ask_pixie()
{
	message("vision", HIR "林震南大怒道：你竟敢窥视我林家辟邪剑谱！今日就让你见识"
                          "见识！\n" NOR, environment(), this_object() );
	kill_ob(this_player());
	return 1;
}
