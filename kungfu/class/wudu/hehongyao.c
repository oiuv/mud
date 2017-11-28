#include <ansi.h>
#include "wudu.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("何红药", ({ "he hongyao", "he" }));
        set("nickname", WHT "疤面丐婆" NOR);
        set("long", @LONG
她就是五毒教的长老，教主的姑姑何红药。虽然是
教主的长辈，但功夫却是一块跟上代教主学的。据
说她曾经被立为教主继承人，但后来犯下大错，所
以被罚到此处看守圣地，以赎前罪。她穿着一身破
旧的衣衫，满脸疤痕，长得骨瘦如柴，双目中满是
怨毒之色。
LONG);
        set("title", "五毒教长老");
        set("gender", "女性");
        set("age", 45);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 30);
        set("int", 40);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 4000);
        set("max_jing", 4000);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 100);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 180);
        set_skill("wudu-xinfa", 180);
        set_skill("xiuluo-yinshagong", 160);
        set_skill("dodge", 180);
        set_skill("jinshe-youshenbu", 180);
        set_skill("strike", 180);
        set_skill("tianchan-zhang", 180);
        set_skill("claw", 180);
        set_skill("wusheng-zhao", 180);
        set_skill("parry", 180);
        set_skill("sword", 180);
        set_skill("jinwu-goufa", 180);
        set_skill("whip", 140);
        set_skill("xiewei-bian", 140);
        set_skill("throwing", 100);
        set_skill("hansha-sheying", 100);
        set_skill("literate", 100);
        set_skill("poison", 120);
        set_skill("wudu-qishu", 120 );
        set_skill("martial-cognize", 160);

        set("no_teach", ([
                "xiuluo-yinshagong"  : "修罗阴煞功必须由教主亲传。",
                "hansha-sheying"     : "含沙射影这技能我都没能够学好。",
        ]));

        map_skill("force", "xiuluo-yinshagong");
        map_skill("dodge", "jinshe-youshenbu");
        map_skill("strike", "tianchan-zhang");
        map_skill("claw", "wusheng-zhao");
        map_skill("throwing", "hansha-sheying");
        map_skill("parry", "jinwu-goufa");
        map_skill("sword", "jinwu-goufa");
        map_skill("whip", "xiewei-bian");
        map_skill("poison", "wudu-qishu");

        prepare_skill("strike", "tianchan-zhang");
        prepare_skill("claw", "wusheng-zhao");

        set("coagents", ({
                ([ "startroom" : "/d/wudu/huating1",
                   "id"        : "he tieshou" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "身形一晃，挡住$n" CYN
                                "，喝道：没有教主准许，谁也不得进入"
                                "本教圣地。" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？给我放下来！" NOR,
        ]));

        create_family("五毒教", 11, "长老");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.duo" :),
                (: perform_action, "claw.lian" :),
                (: perform_action, "strike.chan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();

        carry_object("/d/wudu/npc/obj/jiandao")->wield();
        carry_object("/d/city/obj/cloth")->wear();
        carry_object("/d/wudu/obj/wuxing");

        add_money("gold",2);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -1000)
        {
                command("say 我越看你越象六扇门派来的卧底。");
                return;
        }
        if ((int)ob->query("shen") > -8000)
        {
                command("say 你心慈手软，我是不会收你的！");
                return;
        }
        if ((int)ob->query("combat_exp") < 60000)
        {
                command("say 你还是先去增长点经验吧。");
                return;
        }
        if ((int)ob->query_skill("wudu-xinfa", 1) < 80)
        {
                command("say 你的五毒心法还学的不够啊。");
                return;
        }
        if ((int)ob->query_skill("wudu-qishu", 1) < 50)
        {
                command("say 我五毒教弟子以毒杀人，修习毒技是首要的。");
                command("say 你是否还应该多多钻研本门的绝学？");
                return;
        }

       command("nod");
       command("say 不错，不错。");
       command("recruit " + ob->query("id"));
       ob->set("title", "五毒教护法");
       return;
}
