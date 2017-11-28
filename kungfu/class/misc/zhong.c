// zhong.c

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("钟志灵", ({ "pang toutuo", "pang" ,"toutuo"}));
	set("title", HIY "神龙教" NOR "左护法");
	set("nickname",HIR "辽东胖尊者" NOR);
	set("long", "这头陀身材奇高，而且瘦得出奇；脸上皮包骨头、双\n"
                    "目深陷，当真便如僵尸一般。\n" );
	set("gender", "男性");
	set("age", 44);

	set("str", 32);
        set("int", 28);
        set("con", 31);
	set("dex", 25);

	set("max_qi", 4700);
        set("qi", 4700);
	set("max_jing", 2400);
        set("jing", 2400);
	set("neili", 5800); 
	set("max_neili", 5800);
	set("jiali", 120);
	set("score", 10000000);

	set("combat_exp", 1200000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("force", 200);
	set_skill("hand", 200);
	set_skill("strike", 200);
	set_skill("staff", 200);
	set_skill("parry", 200);
	set_skill("dodge", 200);
	set_skill("yixingbu", 200);
	set_skill("shenlong-bashi", 200);
	set_skill("huagu-mianzhang", 200);
	set_skill("shenlong-xinfa", 200);
	set_skill("shedao-qigong", 200);

	map_skill("staff", "shedao-qigong");
	map_skill("force", "shenlong-xinfa");
	map_skill("hand", "shenlong-bashi");
	map_skill("strike", "huagu-mianzhang");
	map_skill("parry", "shedao-qigong");
	map_skill("dodge", "yixingbu");
	prepare_skill("hand", "shenlong-bashi");
	prepare_skill("strike", "huagu-mianzhang");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.xian" :),
                (: perform_action, "strike.hua" :),
                (: perform_action, "staff.fei" :),
                (: exert_function, "recover" :),
        }));

	create_family("神龙教", 0, "白龙使");

	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/weapon/gangzhang")->wield();
}
