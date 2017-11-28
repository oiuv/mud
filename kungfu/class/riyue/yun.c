#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("张乘云", ({"zhang chengyun", "zhang", "chengyun", "yun"}));
        set("nickname", WHT "白猿神魔" NOR );
        set("title", "日月神教前辈长老");
        set("long", @LONG
白猿神魔张乘云是日月神教的前辈长老，武功
高强，位尊无比。曾一度扫除五岳剑派联盟。
LONG);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 61);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 5400);
        set("max_jing", 4000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 220);
        set("combat_exp", 3000000);
        set("score", 50000);

        set_skill("force", 260);
        set_skill("tianhuan-shenjue", 260);
        set_skill("riyue-xinfa", 220);
        set_skill("dodge", 220);
        set_skill("juechen-shenfa", 220);
        set_skill("cuff", 240);
        set_skill("zhenyu-quan", 240);
        set_skill("claw", 240);
        set_skill("poyue-zhao", 240);
        set_skill("parry", 240);
        set_skill("hammer", 220);
        set_skill("pangu-qishi", 220);
        set_skill("club", 260);
        set_skill("jinyuan-gun", 260);
        set_skill("martial-cognize", 240);
        set_skill("literate", 180);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("hammer", "pangu-qishi");
        map_skill("club", "jinyuan-gun");
        map_skill("parry", "jinyuan-gun");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("日月神教", 7, "前辈长老");

        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "乾坤一击" : "你去让我师兄教你吧。",
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "club.qian" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );

        setup();

        carry_object("/d/heimuya/npc/obj/shutonggun")->wield();
        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 走开，我不收徒。");
}


int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "日月神教")
        {
                command("killair");
                command("say 给我滚开，少在老夫面前说三道四！");
                return -1;
        }

        if (ob->query("family/master_id") != "ren woxing"
           && ob->query("family/master_id") != "xiang wentian")
        {
                command("sneer");
                command("say 你还不配。");
                return -1; 
        }

        if ((int)ob->query("shen") > -60000)
        {
                command("hmm");
                command("say 老夫生平最痛恨的就是你这样的假仁假义之徒！");
                return -1;
        }

        if (skill != "club" && skill != "jinyuan-gun")
        {
                command("hmm");
                command("say 我只传授你这套棍法，其余的找你师父学去。");
                return -1;
        }

        if (skill == "club" && ob->query_skill("club", 1) > 179)
        {
                command("say 你棍法的造诣已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zhangchengfeng"))
        {
                command("nod");
                command("say 念在你有心为本教出力，我就传你这套金猿棍法。");
                ob->set_temp("can_learn/zhangchengfeng", 1);
        }
        return 1;
}