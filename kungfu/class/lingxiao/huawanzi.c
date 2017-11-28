#include <ansi.h>
#include "lingxiao.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("花万紫",({"hua wanzi", "hua", "wanzi"}));
        set("long", "花万紫是凌宵城雪山剑派中少有的女弟子，只见她颇\n"
                    "具姿色，在众多六代弟子中甚为出众。\n");
        set("gender", "女性");
        set("nickname", HIR "寒梅女侠" NOR);
        set("age", 24);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 1000);
        set("max_jing", 800);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("force", 100);
        set_skill("xueshan-neigong", 100);
        set_skill("dodge", 100);
        set_skill("taxue-wuhen", 100);
        set_skill("cuff", 80);
        set_skill("lingxiao-quan", 80);
        set_skill("strike", 80);
        set_skill("piaoxu-zhang", 80);
        set_skill("sword", 140);
        set_skill("hanmei-jian", 140);
        set_skill("parry", 100);
        set_skill("literate", 100);
        set_skill("martial-cognize", 80);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "hanmei-jian");
        map_skill("parry", "hanmei-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        create_family("凌霄城", 6, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.leng" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/city/npc/cloth/xian-cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((string)me->query("gender") != "女性" )
        {
                command("say 我不便收男徒，你去找我师兄吧。");
                return;
        }
        command("say 很好，你以后就跟着我吧。");
        command("recruit " + me->query("id"));
}
