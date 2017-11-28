#include <ansi.h>
#include "gaibang.h"

inherit NPC;
inherit F_MASTER;

#include "fight.h"

mixed ask_skill1();

void create()
{
        set_name("白世镜", ({ "bai shijing", "bai", "shijing" }));
        set("long", @LONG
这是一位须眉皆白的老丐，双目间透出一丝寒
气。他就是丐帮的传功长老白世镜，所擅的缠
丝擒拿手在武林中享名已久。
LONG);
        set("nickname", HIR "大义长老" NOR);
        set("title", "丐帮九袋长老");
        set("gender", "男性");
        set("age", 48);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 4000);
        set("max_jing", 3000);
        set("neili", 4300);
        set("max_neili", 4300);
        set("jiali", 180);
        set("combat_exp", 2200000);
        set("score", 300000);
        set("shen_type", 1);
        
        set_skill("force", 220);
        set_skill("jiaohua-neigong", 180);
        set_skill("huntian-qigong", 220);
        set_skill("dodge", 220);
        set_skill("feiyan-zoubi", 220);
        set_skill("unarmed", 200);
        set_skill("changquan", 200);
        set_skill("jueming-tui", 200);
        set_skill("strike", 200);
        set_skill("tongchui-zhang", 200);
        set_skill("hand", 240);
        set_skill("chansi-shou", 240);
        set_skill("parry", 200);
        set_skill("staff", 220);
        set_skill("jiaohua-bangfa", 220);
        set_skill("begging", 250);
        set_skill("checking", 250);
        set_skill("literate", 180);
        set_skill("martial-cognize", 200);

        map_skill("force", "huntian-qigong");
        map_skill("unarmed", "jueming-tui");
        map_skill("strike", "tongchui-zhang");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("hand", "chansi-shou");
        map_skill("parry", "chansi-shou");
        map_skill("dodge", "feiyan-zoubi");

        prepare_skill("hand", "chansi-shou");

        create_family("丐帮", 18, "长老");

        set("inquiry", ([
                "缠丝擒拿" : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.qin" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/gaibang/npc/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        string title = ob->query("title");
        int lvl = ob->query("family/beggarlvl");

        if (! permit_recruit(ob))
                return;

        if (ob->query("combat_exp") < 120000)
        {
                command("say 你的江湖经验不够，还是先向各位长老学习吧。");
                return;
        }

        if (ob->query("shen") < 20000)
        {
                command("say 你身为丐帮弟子，竟然不做好事？");
                return;
        }

        if (ob->query("family/beggarlvl") < 4)
        {
                command("say 你在本帮的地位太低，还是先向其他师父学习吧。");
                return;
        }

        if (ob->query_skill("force") < 90)
        {
                command("say 你的内功火候还不够，还是先向其他师父学习吧。");
                return;
        }
        command("hmm");
        command("say 我收下你便是，可别给我添麻烦。");
        command("recruit " + ob->query("id"));

        if (ob->query("class") != "beggar")
                ob->set("class", "beggar");

        if (lvl > 0)
        {
                ob->set("family/beggarlvl", lvl);
                ob->set("title", title);
        }
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/chansi-shou/qin"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与在下素不相识，不知此话从何说起？";

        if (me->query_skill("chansi-shou", 1) < 1)
                return "你连缠丝擒拿手都没学，何谈绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在我们丐帮内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 30000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("chansi-shou", 1) < 120)
                return "你的缠丝擒拿手火候还不够，还是下去练高点再来吧。";

        if (me->query_skill("force") < 150)
                return "你现在的内功修为不足，还是练高点再来吧。";

        message_sort(HIY "\n$n" HIY "冷笑一声，大袖一挥，随即只见其"
                     "双手忽折忽扭，或抓或甩，直琐$N" HIY "各处要脉"
                     "。$N" HIY "见状不由大惊，连忙左闪右避，招架拆"
                     "解，可始终未能摆脱$n" HIY "的纠缠，心下甚为折"
                     "服。\n\n" NOR, me, this_object()); 

        command("say 明白了么。");
        tell_object(me, HIC "你学会了「缠丝擒拿」。\n" NOR);
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("chansi-shou"))
                me->improve_skill("chansi-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/chansi-shou/qin", 1);
        me->add("gongxian", -400);

        return 1;
}
