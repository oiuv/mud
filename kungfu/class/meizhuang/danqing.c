#include <ansi.h>
#include "meizhuang.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("丹青生", ({ "danqing sheng", "danqing", "dan", "qing", "sheng" }));
        set("long", @LONG
只见这人髯长及腹，左手拿着一只酒杯，脸上
醺醺然大有醉意，这就是梅庄四位庄主排行第
四的丹青生。他好酒、好画、好剑，人称三绝。
三绝之中，以酒为首，丹青次之，剑道居末。
LONG);
        set("title", "梅庄四庄主");
        set("nickname", HIR "梅庄四友" NOR);
        set("gender", "男性");
        set("age", 54);
        set("attitude", "peaceful");
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 3500);
        set("max_jing", 3000);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 140);
        set("combat_exp", 1000000);

        set_skill("force", 180);
        set_skill("wuzheng-xinfa", 180);
        set_skill("xuantian-wujigong", 180);
        set_skill("dodge", 180);
        set_skill("zuixian-bu", 180);
        set_skill("parry", 180);
        set_skill("sword", 200);
        set_skill("unarmed", 180);
        set_skill("zuiquan-sanda", 180);
        set_skill("pomopima-jian", 200);
        set_skill("strike", 180);
        set_skill("qingmang-zhang", 180);
        set_skill("literate", 180);
        set_skill("drawing", 220);
        set_skill("liquor", 240);
        set_skill("martial-cognize", 180);

        map_skill("force", "xuantian-wujigong");
        map_skill("dodge", "zuixian-bu");
        map_skill("parry", "pomopima-jian");
        map_skill("sword", "pomopima-jian");
        map_skill("strike", "qingmang-zhang");
        map_skill("unarmed", "zuiquan-sanda");

        prepare_skill("unarmed", "zuiquan-sanda");

        create_family("梅庄", 1, "庄主");

        set("inquiry", ([
                "绝招"        : "你要问什么绝招？",
                "绝技"        : "你要问什么绝技？",
                "任我行"      : "任我行乃日月神教上代教主，不过已经失踪很久了。",
                "东方不败"    : "东方教主武功深不可测，天下无敌。",
                "日月神教"    : "我们梅庄四友和日月神教已无瓜葛，你提它作甚？",
                "溪山行旅图"  : "我一直想看看北宋范中立《溪山行旅图》究竟是怎样的。",
                "醉里乾坤"    : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.zui" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

        setup();
                
        carry_object("clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "日月神教" &&
             me->query("family/master_name") == "东方不败" )
        {
                command("yi");
                command("say 我道是谁，原来是东方教主的弟子。");
                command("say 这件事我不便插手，你去找我大哥、二哥好了。");
                me->set("move_party/日月神教—梅庄", 1);
                return;
        }

        if ((int)me->query("combat_exp") < 50000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("wuzheng-xinfa", 1) < 80
           && (int)me->query_skill("xuantian-wujigong", 1) < 80)
        {
                command("say 你连本门的内功都没学好，我收你做甚？");
                return;
        }

        command("en");
        command("say 那你以后就跟着我吧。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/pomopima-jian/zui"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("pomopima-jian", 1) < 1)
                return "你连泼墨披麻剑都没学，何谈此言？";

        if (me->query("gongxian") < 300)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("pomopima-jian", 1) < 120)
                return "你的泼墨披麻剑还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚不精纯，学不了这一招。";

        message_vision(HIY "$n" HIY "哈哈一笑，举起手中酒杯一口饮"
                       "干，说道：好，今日老夫便传你这招！\n$n" HIY
                       "说完左掌猛力拍落，一股掌力击在地下，“蓬”"
                       "的一声响，身子向后\n跃起，已在丈许之外。只"
                       "见他尚未站定，长剑已在身前连划三个圆圈，幻"
                       "作\n三个光圈。三个光圈便如是有形之物，凝在"
                       "空中停得片刻，缓缓向$N" HIY "身前移\n去。"
                       "这几个剑气化成的光圈骤视之似不及一字电剑的"
                       "凌厉，但剑气满室，寒\n风袭体。直看得$N" HIY
                       "目瞪口呆。\n" NOR, me, this_object());
        command("haha");
        command("say 精要便是如此，自己下去练吧。");
        tell_object(me, HIC "你学会了「醉里乾坤」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("pomopima-jian"))
                me->improve_skill("pomopima-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pomopima-jian/zui", 1);
        me->add("gongxian", -300);

        return 1;
}
