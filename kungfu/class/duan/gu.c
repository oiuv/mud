#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("古笃诚", ({ "gu ducheng", "gu", "ducheng" }));
        set("title", "大理国护卫" );
        set("nickname", HIY "忠心耿耿" NOR);
        set("long", "他是大理国四大护卫之一。\n");
        set("gender", "男性");
        set("age", 40);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1800);
        set("max_jing", 1000);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 50);
        set("combat_exp", 500000);
        set("score", 5000);

        set_skill("force", 120);
        set_skill("duanshi-xinfa", 120);
        set_skill("dodge", 120);
        set_skill("tiannan-bu", 120);
        set_skill("cuff", 120);
        set_skill("jinyu-quan", 120);
        set_skill("strike", 120);
        set_skill("wuluo-zhang", 120);
        set_skill("hammer", 140);
        set_skill("pangen-cuojiefu", 140);
        set_skill("parry", 120);
        set_skill("literate", 80);
        set_skill("martial-cognize", 140);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("hammer", "pangen-cuojiefu");
        map_skill("parry", "pangen-cuojiefu");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        set("inquiry", ([
                "错字诀"   : (: ask_skill1 :),
        ]));

        create_family("段氏皇族", 15, "家臣");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.cuo" :),
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
        carry_object("/d/heimuya/npc/obj/dafu")->wield();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("ah");
        command("say 世子殿下何需如此，只要有事吩咐在下一声便是。");
        command("say 若世子不嫌弃，我这里倒是有一套斧法可以传授予你。");

        return;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "段氏皇族")
        {
                command("heng");
                command("say 你算什么人？古某为何要听命于你？");
                return -1;
        }

        if (skill != "pangen-cuojiefu" && skill != "hammer")
        {
                command("say 我就只有这套斧法拿得出手，其余的还是找你爹爹学吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/guducheng"))
        {
                command("hehe");
                command("say 既然世子有心习武，在下理当竭尽所能传授。");
                ob->set_temp("can_learn/guducheng", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/pangen-cuojiefu/cuo"))
                return "这个…这…在下不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和古某素不相识，何出此言？";

        if (me->query_skill("pangen-cuojiefu", 1) < 1)
                return "世子殿下还是先学了在下的盘根错节斧再说吧。";

        if (me->query("gongxian") < 150)
                return "这个…不是我不愿意…只是王爷吩咐了，无功劳者不得…那个。";

        if (me->query_skill("force") < 120)
                return "这个…世子殿下的内功修为还有待提高。";

        if ((int)me->query("max_neili", 1) < 800)
                return "这个…世子殿下的内力修为还有待提高。";

        if (me->query_skill("pangen-cuojiefu", 1) < 100)
                return "世子殿下盘根错节斧的火候还不够，尚且用不了这招。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，随即取出腰"
                     "间大斧，力贯斧柄，陡然间一声断喝，接连猛挥数斧"
                     "，威猛中不失精奇，招数巧妙，气势如虹。\n\n" NOR,
                     me, this_object()); 

        command("bow");
        command("say 古某才识浅薄，所学仅此而已，让世子殿下见笑了。");
        tell_object(me, HIC "你学会了「错字诀」。\n" NOR);
        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("pangen-cuojiefu"))
                me->improve_skill("pangen-cuojiefu", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pangen-cuojiefu/cuo", 1);
        me->add("gongxian", -150);
        return 1;
}
