inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

#include <ansi.h>
#include "emei.h"

string ask_for_quit();

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();
mixed ask_skill8();
mixed ask_skill9();

void create()
{
        set_name("灭绝师太", ({ "miejue shitai", "miejue", "shitai", "mie", "jue"}));
        set("long", "她是峨嵋派的第三代弟子，现任峨嵋派掌门人。\n");
        set("gender", "女性");
        set("age", 62);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("inquiry",([
                "剃度"     : "要剃度找静玄。",
                "出家"     : "要剃度找静玄。",
                "云海明灯" : "自张无忌应我三掌之约，而我败于他后，我已发誓不用飘雪穿云掌了。",
                "佛光普照" : "哼，自从光明顶一战后，我早已将这招封存，你找别人吧。",
                "绝招"     : "我峨眉派绝学如此之多，你到底要问什么绝招？",
                "绝技"     : "我峨眉派绝学如此之多，你到底要问什么绝技？",
                "还俗"     : (: ask_for_quit :),
                "灭剑"     : (: ask_skill1 :),
                "绝剑"     : (: ask_skill2 :),
                "星罗棋布" : (: ask_skill3 :),
                "八式合一" : (: ask_skill4 :),
                "截筋断脉" : (: ask_skill5 :),
                "凌空指穴" : (: ask_skill6 :),
                "无形幻影" : (: ask_skill7 :),
                "佛光初现" : (: ask_skill8 :),
                "伏魔剑诀" : (: ask_skill9 :),
        ]));

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 4500);
        set("max_jing", 3000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jingli", 1200);
        set("max_jingli", 1200);
        set("jiali", 200);
        set("combat_exp", 2500000);
        set("score", 50000);

        set_skill("force", 260);
        set_skill("emei-xinfa", 260);
        set_skill("emei-jiuyang", 200);
        set_skill("linji-zhuang", 260);
        set_skill("dodge", 240);
        set_skill("zhutian-bu", 240);
        set_skill("finger", 240);
        set_skill("tiangang-zhi", 240);
        set_skill("hand", 240);
        set_skill("jieshou-jiushi", 240);
        set_skill("strike", 260);
        set_skill("jinding-zhang", 260);
        set_skill("piaoxue-zhang", 260);
        set_skill("sixiang-zhang", 260);
        set_skill("sword", 260);
        set_skill("huifeng-jian", 260);
        set_skill("emei-jian", 260);
        set_skill("yitian-jian", 260);
        set_skill("blade", 240);
        set_skill("yanxing-dao", 240);
        set_skill("parry", 260);
        set_skill("martial-cognize", 200);
        set_skill("literate", 200);
        set_skill("mahayana", 200);
        set_skill("buddhism", 200);

        set("no_teach", ([
                "emei-jiuyang" : "这峨嵋九阳功乃残缺不全的九阳神功，临济十二庄"
                "胜之千倍，你还是学它好了。",
        ]));

        map_skill("force", "linji-zhuang");
        map_skill("dodge", "zhutian-bu");
        map_skill("finger", "tiangang-zhi");
        map_skill("hand", "jieshou-jiushi");
        map_skill("strike", "jinding-zhang");
        map_skill("sword", "huifeng-jian");
        map_skill("blade", "yanxing-dao");
        map_skill("parry", "yitian-jian");

        prepare_skill("strike", "jinding-zhang");
        prepare_skill("hand", "jieshou-jiushi");

        create_family("峨嵋派", 3, "掌门人");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.mie" :),
                (: perform_action, "sword.jue" :),
                (: perform_action, "finger.ling" :),
                (: perform_action, "strike.bashi" :),
                (: perform_action, "hand.jie" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/city/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        string name, new_name;

        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 30000)
        {
                command("say 你行侠仗义之事做的太少！实在是太少！");
                return;
        }

        if ((int)ob->query("combat_exp") < 300000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)ob->query_skill("mahayana", 1) < 100)
        {
                command("say 你大乘涅磐功修为还不行，好好感悟感悟！");
                return;
        }

        if ((int)ob->query_skill("emei-xinfa",1) < 100)
        {
                command("say 怎么回事？本门内功心法你怎么学的？好好给我练功去！");
                return;
        }

        name = ob->query("name");
        new_name = "静" + name[2..3];
        NAME_D->remove_name(ob->query("name"), ob->query("id"));
        ob->set("name", new_name);
        NAME_D->map_name(ob->query("name"), ob->query("id"));

        command("say 好吧，我就收下你了。");
        command("say 以后你就叫作" + new_name + "，要像为师一样，把天下的恶人统统杀光！");
        command("recruit " + ob->query("id"));
}

string ask_for_quit()
{
        object me;
        me = this_player();

        if (me->query("family/family_name") != "峨嵋派")
                return "你是什么人？跑到这里来捣乱？\n";

        if( (string)me->query("class") != "bonze" )
                return "阿弥陀佛！你本是俗家人，何谈还俗？\n";

        me->set_temp("pending/quit_bonze", 1);
        command("heng");
        return "你好好的给我安心修炼，以后降妖除魔，别天天满脑子不正经。\n";
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/huifeng-jian/mie"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("huifeng-jian", 1) < 1)
                return "你连回风拂柳剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功修行太浅，怎能使出这回风拂柳剑法中的精妙之处？";

        if (me->query_skill("huifeng-jian", 1) < 120)
                return "你回风拂柳剑法尚未修炼得精深，哪里能领会其中的微妙之处？";

        if (me->query("shen") < 30000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "微微点了点头，不露半点声色，将$N" HIY
                     "招至跟前，在耳边秘密的说了些什么。$N" HIY "听后会心的"
                     "一笑，似乎明白了什么。\n\n" NOR, me, this_object());

        command("say 以后对那些妖人不要手软，一上来就用这招！");
        tell_object(me, HIC "你学会了「灭剑」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("huifeng-jian"))
                me->improve_skill("huifeng-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huifeng-jian/mie", 1);
        me->add("gongxian", -1000);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/huifeng-jian/jue"))
                return "你自己多练练，降妖除魔就靠你们这些人了！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("huifeng-jian", 1) < 1)
                return "你连回风拂柳剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1800)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 300)
                return "你的内功修行太浅，怎能使出这回风拂柳剑法中的精妙之处？";

        if (me->query_skill("huifeng-jian", 1) < 180)
                return "你回风拂柳剑法尚未修炼得精深，哪里能领会其中的微妙之处？";

        if (me->query("shen") < 30000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "呆呆的望着天空，激动万分，口中喃喃道"
                     "：“我峨嵋派真是后继有人啊。”过了半晌，$n" HIY "才"
                     "回过神来，在$N" HIY "耳边秘密的说了些什么。\n\n" NOR,
                     me, this_object());

        command("say 听好了！以后对那些妖人不要手软，见一个杀一个，"
                "见两个杀一双！");
        tell_object(me, HIC "你学会了「绝剑」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("huifeng-jian"))
                me->improve_skill("huifeng-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huifeng-jian/jue", 1);
        me->add("gongxian", -1800);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/sixiang-zhang/xing"))
                return "你自己多练练，降妖除魔就靠你们这些人了！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("sixiang-zhang", 1) < 1)
                return "你连四象掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 80)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 100)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("sixiang-zhang", 1) < 70)
                return "你的四象掌法火候未到，尚且学不了这一招。";

        if (me->query("shen") < 5000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "略微点了点头，说道：“看好了！”随即"
                     "一声清啸，双掌纷飞贯出，掌影重重叠叠，虚实难辨，全全"
                     "笼罩$N" HIY "全身。\n\n" NOR, me, this_object());

        command("say 刚才我所施展的便是这式星罗棋布，你自己下去练习吧。");
        tell_object(me, HIC "你学会了「星罗棋布」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("sixiang-zhang"))
                me->improve_skill("sixiang-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/sixiang-zhang/xing", 1);
        me->add("gongxian", -80);
        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();
        if (me->query("can_perform/jinding-zhang/bashi"))
                return "你自己多练练，降妖除魔就靠你们这些人了！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("jinding-zhang", 1) < 1)
                return "你连金顶绵掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 250)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 120)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("jinding-zhang", 1) < 100)
                return "你的金顶绵掌火候未到，尚且学不了这一招。";

        if (me->query("shen") < 8000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "朝着$N" HIY "赞许的点了点头，说道：“"
                     "既然如此，今日我便传授你此招！”说完$n" HIY "深深吸"
                     "了一口气，站起身来，提于全身功力于双掌猛力拍出，顿时"
                     "只听“砰”的一声巨响，$N" HIY "面前那张青石桌案应声"
                     "而碎，尘沙四起，石屑飞溅。直看得$N" HIY "目瞪口呆。"
                     "\n\n" NOR, me, this_object());

        command("say 这招并不复杂，只须下去后勤加练习便可。");
        tell_object(me, HIC "你学会了「八式合一」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("jinding-zhang"))
                me->improve_skill("jinding-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jinding-zhang/bashi", 1);
        me->add("gongxian", -250);
        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();
        if (me->query("can_perform/jieshou-jiushi/jie"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("jieshou-jiushi", 1) < 1)
                return "你连截手九式都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "哼，你在本派中碌碌无为，这一招我暂时还不能传你。";

        if (me->query("max_neili") < 850)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("force") < 120)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("jieshou-jiushi", 1) < 100)
                return "你的截手九式火候未到，尚且学不了这一招。";

        if (me->query("shen") < 12000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "甚喜，对$N" HIY "点头道：“不错，不"
                     "错。你这孩子，真不亏了我平时的教诲。”说完将$N" HIY
                     "招至跟前，细说良久。\n\n" NOR, me, this_object());

        command("say 这招用来对付妖人再合适不过。你自己下去练吧。");
        tell_object(me, HIC "你学会了「截筋断脉」。\n" NOR);

        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("jieshou-jiushi"))
                me->improve_skill("jieshou-jiushi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jieshou-jiushi/jie", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();
        if (me->query("can_perform/tiangang-zhi/ling"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("tiangang-zhi", 1) < 1)
                return "你连天罡指穴法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 250)
                return "哼，你在本派中碌碌无为，这一招我暂时还不能传你。";

        if (me->query("max_neili") < 800)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("force") < 100)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("tiangang-zhi", 1) < 100)
                return "你的天罡指穴法火候未到，尚且学不了这一招。";

        if (me->query("shen") < 10000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "甚喜，对$N" HIY "点头道：“不错，不"
                     "错。你这孩子，真不亏了我平时的教诲。”说完将$N" HIY
                     "招至跟前，细说良久。\n\n" NOR, me, this_object());

        command("say 刚才我所说的你都记住了吗？自己下去练吧。");
        tell_object(me, HIC "你学会了「凌空指穴」。\n" NOR);

        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("tiangang-zhi"))
                me->improve_skill("tiangang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tiangang-zhi/ling", 1);
        me->add("gongxian", -250);
        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yanxing-dao/huan"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("yanxing-dao", 1) < 1)
                return "你连雁行刀法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "哼，你在本派中碌碌无为，这一招我暂时还不能传你。";

        if (me->query("max_neili") < 800)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("force") < 120)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("yanxing-dao", 1) < 80)
                return "你的雁行刀法火候未到，尚且学不了这一招。";

        if (me->query("shen") < 15000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "微微一笑，沉声道：“要修成这一招，须"
                     "得通晓四象八卦之学。”$N" HIY "点了点头，朗声说道："
                     "“阳分太阳、少阴，阴分少阳、太阴，是为四象。太阳为乾"
                     "兑，少阴为离震，少阳为巽坎，太阴为艮坤。乾南、坤北、"
                     "离东、坎西、震东北、兑东南、巽西南、艮西北。自震至乾"
                     "为顺，自巽至坤为逆。正如师父所教：天地定位，山泽通气"
                     "，雷风相薄，水火不相射，八卦相错。数往者顺，知来者逆"
                     "。”$n" HIY "听后大喜，说道：“不错，不错。我果然没"
                     "看错你，这便传授你此招！”$n" HIY "在$N" HIY "耳畔低"
                     "声细说良久，$N" HIY "听后会心的一笑，似乎领悟到了什"
                     "么。\n\n" NOR, me, this_object());

        command("say 刚才我所说的须记牢了，自己下去练吧。");
        tell_object(me, HIC "你学会了「无形幻影」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("yanxing-dao"))
                me->improve_skill("yanxing-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yanxing-dao/huan", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();
        if (me->query("can_perform/emei-jian/xian"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("emei-jian", 1) < 1)
                return "你连峨嵋剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 80)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("emei-jian", 1) < 60)
                return "你峨嵋剑法尚未修炼得精深，没法用这招。";

        if (me->query("shen") < 3000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "微微点了点头，不露半点声色，将$N" HIY
                     "招至跟前，在耳边轻声的说了些什么。$N" HIY "听后会心"
                     "的一笑，似乎明白了什么。\n\n" NOR, me, this_object());

        command("say 这招很简单，下去后稍加练习便成。");
        tell_object(me, HIC "你学会了「佛光初现」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("emei-jian"))
                me->improve_skill("emei-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/emei-jian/xian", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yitian-jian/fumo"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("yitian-jian", 1) < 1)
                return "你连倚天剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 500)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("yitian-jian", 1) < 120)
                return "你倚天剑法尚未修炼得精深，没法用这招。";

        if (me->query("shen") < 20000)
                return "哼！你行侠仗义的事情还做得不够！做得不够！";

        message_sort(HIY "\n$n" HIY "微微点了点头，不露半点声色，将$N" HIY
                     "招至跟前，在耳边轻声的说了些什么。$N" HIY "听后会心"
                     "的一笑，似乎明白了什么。\n\n" NOR, me, this_object());

        command("sigh");
        command("say 如果那柄倚天剑还在的话，用这招最爽快不过。");
        tell_object(me, HIC "你学会了「伏魔剑诀」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yitian-jian"))
                me->improve_skill("yitian-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yitian-jian/fumo", 1);
        me->add("gongxian", -500);
        return 1;
}

void unconcious()
{
        die();
}
