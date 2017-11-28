#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();

void create()
{
        set_name("段正淳", ({ "duan zhengchun", "duan", "zhengchun" }));
        set("title",  "大理国护国大将军" );
        set("nickname", HIR "镇南王" NOR);
        set("long", "他就是大理国的镇南王，当今皇太弟，是有名的爱情圣手。\n");
        set("gender", "男性");
        set("age", 45);
        set("class", "royal");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 28);
        set("int", 30);
        set("con", 31);
        set("dex", 30);
        set("max_qi", 4500);
        set("max_jing", 3000);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 200);
        set("combat_exp", 2500000);
        set("score", 50000);

        set_skill("force", 220);
        set_skill("duanshi-xinfa", 220);
        set_skill("dodge", 200);
        set_skill("tiannan-bu", 200);
        set_skill("cuff", 220);
        set_skill("jinyu-quan", 220);
        set_skill("strike", 220);
        set_skill("wuluo-zhang", 220);
        set_skill("sword", 220);
        set_skill("staff", 220);
        set_skill("duanjia-jian", 220);
        set_skill("finger", 200);
        set_skill("qiantian-zhi", 200);
        set_skill("yiyang-zhi", 200);
        set_skill("parry", 220);
        set_skill("jingluo-xue", 180);
        set_skill("literate", 240);
        set_skill("martial-cognize", 200);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("finger", "yiyang-zhi");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("parry", "yiyang-zhi");
        map_skill("sword", "duanjia-jian");
        map_skill("staff", "yiyang-zhi");

        prepare_skill("finger", "yiyang-zhi");

        create_family("段氏皇族", 15, "传人");

        set("inquiry", ([
                "乾阳神指" : (: ask_skill1 :),
                "风云变幻" : (: ask_skill2 :),
                "金玉满堂" : (: ask_skill3 :),
                "惊天一剑" : (: ask_skill4 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "finger.qian" :),
                (: perform_action, "finger.dian" :),
                (: perform_action, "sword.jing" :),
                (: perform_action, "sword.lian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
        add_money("silver", 50);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("nod");
        command("say 我就收下你，望你好好学习我段家武技，将来有所作为。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/qiantian-zhi/zhi"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("qiantian-zhi", 1) < 1)
                return "你连乾天指法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query_skill("force") < 100)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 500)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("qiantian-zhi", 1) < 80)
                return "你的乾天指法功力还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "点了点头，将$N" HIY "招至身边，在"
                     "$N" HIY "耳旁低声细说良久，$N" HIY "一边听一边不"
                     "住的点头，看样子大有所悟。\n\n" NOR,
                     me, this_object()); 

        command("nod");
        command("say 这招很简单，稍加练习便成。");
        tell_object(me, HIC "你学会了「乾阳神指」。\n" NOR);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("qiantian-zhi"))
                me->improve_skill("qiantian-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qiantian-zhi/zhi", 1);
        me->add("gongxian", -50);

        return 1;
}


mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wuluo-zhang/bian"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("wuluo-zhang", 1) < 1)
                return "你连五罗轻烟掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query_skill("force") < 100)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 500)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("wuluo-zhang", 1) < 100)
                return "你的五罗轻烟掌还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，当下更不答话，伸出右掌轻轻"
                     "一抖，登时化出五道掌影，轻飘飘的拍了出去，却听“噗噗"
                     "噗”几声，$n" HIY "掌影激起的劲风竟在$N" HIY "周围的"
                     "地面印出了五个手印。\n\n" NOR, me, this_object()); 

        command("say 看懂了么？");
        tell_object(me, HIC "你学会了「风云变幻」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("wuluo-zhang"))
                me->improve_skill("wuluo-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wuluo-zhang/bian", 1);
        me->add("gongxian", -150);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/jinyu-quan/man"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("jinyu-quan", 1) < 1)
                return "你连金玉拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query_skill("force") < 100)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 500)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("jinyu-quan", 1) < 80)
                return "你的金玉拳法还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "点了点头，将$N" HIY "招至身边，在"
                     "$N" HIY "耳旁低声细说良久，$N" HIY "一边听一边不"
                     "住的点头，看样子大有所悟。\n\n" NOR,
                     me, this_object()); 

        command("nod");
        command("say 好了，你自己去练吧。");
        tell_object(me, HIC "你学会了「金玉满堂」。\n" NOR);
        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("jinyu-quan"))
                me->improve_skill("jinyu-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jinyu-quan/man", 1);
        me->add("gongxian", -150);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();
        if (me->query("can_perform/duanjia-jian/jing"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("duanjia-jian", 1) < 1)
                return "你连段家剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query("shen") < 0)
                return "算了吧，传你绝招只怕你又去作恶！";

        if (me->query_skill("force") < 120)
                return "你的内功的修为不够，练高了再来吧。";

        if (me->query("max_neili") < 800)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("duanjia-jian", 1) < 80)
                return "你的段家剑法还不行，练练再说吧！";

        message_sort(HIY "\n$n" HIY "点了点头，沉声道：“我这就给你演示"
                     "一遍，可看清楚了！”说罢只见$n" HIY "拔出腰间长剑"
                     "，深吸一口气，脚下步步进击，稳重之极，手中长剑使得"
                     "犹如飞龙一般，缠绕向$N" HIY "。招式之巧妙，实乃$N"
                     HIY "前所未闻。\n\n" NOR, me, this_object());

        command("haha");
        command("say 招式已经传你了，你自己练去吧。");
        tell_object(me, HIC "你学会了「惊天一剑」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("duanjia-jian"))
                me->improve_skill("duanjia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/duanjia-jian/jing", 1);
        me->add("gongxian", -300);

        return 1;
}

void unconcious()
{
        die();
}
