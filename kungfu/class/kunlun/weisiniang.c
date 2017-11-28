#include <ansi.h>
#include "kunlun.h"

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("卫四娘", ({"wei siniang", "wei", "siniang"}));
	set("long", "她昆仑派第五代弟子，容颜俏丽，身材丰满，举\n"
                    "手投足间带着点挑逗之意。\n");
        set("nickname", HIY "闪电娘娘" NOR);
	set("gender", "女性");
	set("age", 38);
	set("attitude", "heroism");
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 2000);
        set("max_jing", 1500);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 1000000);

        set_skill("force", 130);
        set_skill("kunlun-xinfa", 130);
        set_skill("dodge", 130);
        set_skill("chuanyun-bu", 130);
        set_skill("hand", 140);
        set_skill("sanyin-shou", 140);
        set_skill("cuff", 140);
        set_skill("zhentian-quan", 140);
        set_skill("parry", 140);
        set_skill("sword", 130);
        set_skill("xunlei-jian", 130);
        set_skill("throwing", 140);
        set_skill("kunlun-qifa", 140);
        set_skill("literate", 140);
        set_skill("liangyi-shengong", 130);
        set_skill("zhengliangyi-jian", 130);
        set_skill("martial-cognize", 120);

        set("no_teach", ([
                "liangyi-shengong"  : "两仪神功需得掌门人亲自传授。",
                "zhengliangyi-jian"  : "正两仪剑法乃本门神功，需要掌门人亲自传授。",
        ]));

        map_skill("force", "liangyi-shengong");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "xunlei-jian");
        map_skill("sword", "zhengliangyi-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("cuff", "zhentian-quan");

	create_family("昆仑派", 5, "弟子");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.shi" :),
                (: perform_action, "sword.xun" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

	setup();
        carry_object("/d/kunlun/obj/sword")->wield();
        carry_object("/d/kunlun/obj/pao3")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if (me->query("gender") != "女性")
        {
                command("say 师傅不准我收男弟子，你去找我师兄去吧。");
                return;
        }

        if ((int)me->query("combat_exp") < 10000)
        {
                command("say 你的江湖经验实在太浅，还是锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("kunlun-xinfa", 1) < 30)
        {
                command("say 你对本门的内功心法所知尚浅，练习高了再来找我吧。");
                return;
        }

        command("say 既然" + RANK_D->query_respect(me) + "这么努力，我就收下你吧。");
        command("recruit " + me->query("id"));
}
