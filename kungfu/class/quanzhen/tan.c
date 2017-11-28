#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("谭处端", ({ "tan chuduan", "tan", "chuduan" }));
        set("long", @LONG
他就是全真次徒谭处端谭真人，只见他身材魁
梧，浓眉大眼，嗓音洪亮，在拜得重阳真人为
师前本是铁匠出身。
LONG);
        set("nickname", HIY "长真子" NOR);
        set("title", "全真七子");
        set("gender", "男性");
        set("age", 40);
        set("class", "taoist");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 28);
        set("dex", 30);
        set("max_qi", 5200);
        set("max_jing", 4000);
        set("neili", 5600);
        set("max_neili", 5600);
        set("jiali", 200);

        set("combat_exp", 2600000);

        set_skill("force", 240);
        set_skill("quanzhen-xinfa", 240);
        set_skill("xuanmen-neigong", 240);
        set_skill("sword", 240);
        set_skill("qixing-jian", 240);
        set_skill("quanzhen-jian", 240);
        set_skill("dodge", 220);
        set_skill("tianshan-feidu", 220);
        set_skill("jinyan-gong", 220);
        set_skill("parry", 220);
        set_skill("strike", 240);
        set_skill("chongyang-shenzhang", 240);
        set_skill("haotian-zhang", 240);
        set_skill("hand", 240);
        set_skill("qixing-shou", 240);
        set_skill("finger", 240);
        set_skill("zhongnan-zhi", 240);
        set_skill("literate", 240);
        set_skill("taoism", 240);
        set_skill("martial-cognize", 240);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("parry", "quanzhen-jian");
        map_skill("finger", "zhongnan-zhi");
        map_skill("hand", "qixing-shou");
        map_skill("strike", "haotian-zhang");

        prepare_skill("hand", "qixing-shou");
        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 2, "弟子");

        set("inquiry", ([
                "三花聚顶" : (: ask_skill1 :),
        ]) );

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.po" :),
                (: perform_action, "strike.ju" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 100
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 100)
        {
                command("say 你的本门内功心法火候不足，难以领略更高深的武功。");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 100)
        {
                command("say 你在修身养性方面还需多加锻炼，等你道学心法够高后再来吧。");
                return;
        }

        if ((int)ob->query("shen") < 30000)
        {
                command("say 你这人行侠仗义的事情做得太少！\n");
                return;
        }

        command("haha");
        command("say 甚好，甚好。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/haotian-zhang/ju"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("haotian-zhang", 1) < 1)
                return "你连昊天掌都没学，何谈绝招可言？";

        if (me->query("gongxian") < 250)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 30000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("haotian-zhang", 1) < 120)
                return "你的昊天掌不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 180)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "眉头一皱，上下打量了$N" HIY "一番"
                     "，当下更不答话，衣袖轻轻一抖，猛然大喝一声，顿时"
                     "双掌纷飞，掌劲朝四面八方云贯而出，气势恢弘之极。"
                     "\n\n" NOR, me, this_object()); 

        command("say 看懂了么？");
        tell_object(me, HIC "你学会了「三花聚顶」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("haotian-zhang"))
                me->improve_skill("haotian-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/haotian-zhang/ju", 1);
        me->add("gongxian", -250);

        return 1;
}
