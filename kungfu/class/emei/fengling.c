inherit NPC;
inherit F_MASTER;

#include <ansi.h>
#include "emei.h"

mixed ask_skill1();
mixed ask_skill2();

void create()
{
       set_name("风陵师太", ({"fengling shitai", "fengling", "shitai", "feng", "ling"}));
       set("long", "她就是峨嵋派第二代掌门人风陵师太。\n"
                   "她面目慈祥，便如寻常老尼一般，浑\n"
                   "不带一丝尘俗之气。\n");
        set("gender", "女性");
        set("age", 62);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 7000);
        set("max_jing", 6000);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 250);
        set("combat_exp", 5000000);

        set_skill("force", 320);
        set_skill("emei-xinfa", 300);
        set_skill("emei-jiuyang", 320);
        set_skill("linji-zhuang", 320);
        set_skill("dodge", 300);
        set_skill("zhutian-bu", 300);
        set_skill("finger", 300);
        set_skill("tiangang-zhi", 300);
        set_skill("hand", 300);
        set_skill("jieshou-jiushi", 300);
        set_skill("strike", 320);
        set_skill("jinding-zhang", 300);
        set_skill("piaoxue-zhang", 320);
        set_skill("sixiang-zhang", 300);
        set_skill("sword", 320);
        set_skill("huifeng-jian", 320);
        set_skill("emei-jian", 300);
        set_skill("blade", 300);
        set_skill("yanxing-dao", 300);
        set_skill("parry", 300);
        set_skill("martial-cognize", 300);
        set_skill("literate", 280);
        set_skill("mahayana", 300);
        set_skill("buddhism", 300);

        set("no_teach", ([
                "emei-jiuyang" : "这峨嵋九阳功乃残缺不全的九阳神功，临济十二庄"
                                 "胜之千倍，你还是学它好了。",
        ]));

        map_skill("force", "emei-jiuyang");
        map_skill("dodge", "zhutian-bu");
        map_skill("finger", "tiangang-zhi");
        map_skill("hand", "jieshou-jiushi");
        map_skill("strike", "piaoxue-zhang");
        map_skill("sword", "huifeng-jian");
        map_skill("blade", "yanxing-dao");
        map_skill("parry", "jinding-zhang");

        prepare_skill("strike", "piaoxue-zhang");

        create_family("峨嵋派", 2, "掌门人");

        set("inquiry",([
                "剃度"     : "要剃度找静玄。",
                "出家"     : "要剃度找静玄。",
                "云海明灯" : (: ask_skill1 :),
                "佛光普照" : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.yun" :),
                (: perform_action, "strike.zhao" :),
                (: exert_function, "recover" :),
                (: exert_function, "shield" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        carry_object("/d/city/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        string name, new_name;

        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 30000)
        {
                command("say 你行侠仗义的事情还做得不够，我暂时还不能收你。");
                return;
        }

        if ((int)ob->query("combat_exp") < 500000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)ob->query_skill("mahayana", 1) < 150)
        {
                command("say 你大乘涅磐功的修为还不行，好好感悟感悟！");
                return;
        }

        if ((int)ob->query_skill("linji-zhuang", 1) < 150)
        {
                command("say 临济十二庄乃我峨嵋第一奇功，须得好好练习。");
                return;
        }

        name = ob->query("name");
        new_name = "灭" + name[2..3];
        NAME_D->remove_name(ob->query("name"), ob->query("id"));
        ob->set("name", new_name);
        NAME_D->map_name(ob->query("name"), ob->query("id"));

        command("say 不错，不错！");
        command("say 今日我便收你为徒，法号" + new_name + "。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/piaoxue-zhang/yun"))
                return "这一招我不是已经传授予你了吗？还有什么不懂就自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "我与阁下素无来往，不知阁下打听这个干嘛？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能学习此招，你还是走吧。";

        if (me->query_skill("piaoxue-zhang", 1) < 1)
                return "你连飘雪穿云掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1800)
                return "你对峨嵋派所作出的贡献还不够，这招我暂时不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query("max_neili") < 2000)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("piaoxue-zhang", 1) < 150)
                return "你的飘雪穿云掌火候未到，尚且学不了这一招。";

        if (me->query("shen") < 40000)
                return "你行侠仗义的事情还做得不够，我暂时还不能传你此招。";

        message_sort(HIY "\n$n" HIY "微微一笑，对$N" HIY "说道：“既然你内"
                     "外功均已达至如此境界，也不枉了我平时的一翻栽培。今日"
                     "我便传你此招，希望日后能将我峨嵋派发扬光大。”说完，"
                     "$n" HIY "将$N" HIY "招至跟前，在$N" HIY "耳旁轻声细说"
                     "良久。\n\n" NOR, me, this_object());

        command("nod");
        command("say 刚才我所说的你都记清了吗？记清了就下去练吧。");
        tell_object(me, HIC "你学会了「云海明灯」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("piaoxue-zhang"))
                me->improve_skill("piaoxue-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/piaoxue-zhang/yun", 1);
        me->add("gongxian", -1800);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/piaoxue-zhang/zhao"))
                return "这一招我不是已经传授予你了吗？还有什么不懂就自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "我与阁下素无来往，不知阁下打听这个干嘛？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能学习此招，你还是走吧。";

        if (me->query_skill("piaoxue-zhang", 1) < 1)
                return "你连飘雪穿云掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2200)
                return "你对峨嵋派所作出的贡献还不够，这招我暂时不能传你。";

        if (me->query_skill("force") < 300)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query("max_neili") < 3500)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("piaoxue-zhang", 1) < 180)
                return "你的飘雪穿云掌火候未到，尚且学不了这一招。";

        if (me->query("shen") < 40000)
                return "你行侠仗义的事情还做得不够，我暂时还不能传你此招。";

        message_sort(HIY "\n$n" HIY "轻轻拍了拍$N" HIY "的头，说道：“好"
                     "吧，难得你如此有心，今日我就将此招演示一遍，可得看"
                     "好了！”话音刚落，只见$n" HIY "狂提内劲，周身骨骼无"
                     "不噼啪作响，面赤如血，煞是惊人。随即$n" HIY "一声暴"
                     "喝，双掌携着隐隐风雷之势猛力向前拍出，顿时只听“喀"
                     "嚓”一声巨响，前方崖边一颗碗口粗的松树应声而断，断"
                     "枝仍是余势未尽，向前又飞出数丈，这才跌落至山谷之中"
                     "。须臾，便闻山谷下回声四起，在峨嵋群山中回荡了好一"
                     "阵才消失殆尽。$n" HIY "微微一笑，长吁一口气，缓缓收"
                     "回内劲，朝$N" HIY "望去，见$N" HIY "早已看得目瞪口"
                     "呆。\n\n" NOR, me, this_object());

        command("say 这招你下去后一定要勤加练习，才能发挥出它的威力。");
        tell_object(me, HIC "你学会了「佛光普照」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("piaoxue-zhang"))
                me->improve_skill("piaoxue-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/piaoxue-zhang/zhao", 1);
        me->add("gongxian", -2200);
        return 1;
}
