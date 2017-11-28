#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_jiansuo();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();

#define JIANSUO    "/clone/lonely/jiansuo"

int try_to_learn_quan();

void create()
{
        object ob;
        set_name("陈家洛", ({ "chen jialuo", "chen","jialuo" }));
        set("title", "红花会少总舵主");
        set("long", "他一副模样直是个富贵人家的纨裤子弟，丰\n"
                    "姿如玉，目朗似星，轻袍缓带，手中摇着一\n"
                    "柄折扇，神采飞扬，气度闲雅，吐属斯文。\n"
                    "服饰俨然是个贵介公子。\n");
        set("nickname", HIW "玉面神龙" NOR);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 22);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 5000);
        set("max_jing", 4000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 4000000);
        set("score", 5000000);

        set_skill("force", 260);
        set_skill("zhanshen-xinjing", 260);
        set_skill("tianchi-neigong", 240);
        set_skill("honghua-xinfa", 240);
        set_skill("dodge", 260);
        set_skill("zhuangzi-wu", 260);
        set_skill("yanzi-chuanyun", 240);
        set_skill("parry", 240);
        set_skill("unarmed", 260);
        set_skill("baihua-cuoquan", 260);
        set_skill("claw", 260);
        set_skill("strike", 260);
        set_skill("cuff", 260);
        set_skill("blade", 220);
        set_skill("hanwang-qingdao", 220);
        set_skill("sword", 220);
        set_skill("sanfen-jianshu", 220);
        set_skill("whip", 240);
        set_skill("jiandun-zhusuo", 240);
        set_skill("martial-cognize", 250);
        set_skill("literate", 250);

        map_skill("dodge", "zhuangzi-wu");
        map_skill("force", "zhanshen-xinjing");
        map_skill("unarmed", "baihua-cuoquan");
        map_skill("parry", "baihua-cuoquan");
        map_skill("sword", "sanfen-jianshu");
        map_skill("whip", "jiandun-zhusuo");
        map_skill("blade", "hanwang-qingdao");

        prepare_skill("unarmed", "baihua-cuoquan");

        set("no_teach", ([
                "sanfen-jianshu"  : "这剑法乃是我承蒙翠羽黄衫霍姑娘所授，并不外传。",
                "hanwang-qingdao" : "嗯，这刀法你找文夫人骆冰学去吧，我不便教授。",
                "baihua-cuoquan"  : (: try_to_learn_quan :),
        ]));

        create_family("红花会", 4, "少总舵主");

        set("inquiry", ([
                "剑盾珠索"   : (: ask_jiansuo :),
                "缚字诀"     : (: ask_skill1 :),
                "千头万绪"   : (: ask_skill2 :),
                "化蝶"       : (: ask_skill3 :),
                "百花错乱"   : (: ask_skill4 :),
                "百花错易"   : (: ask_skill5 :),
                "战神轰天诀" : (: ask_skill6 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.luan" :),
                (: perform_action, "unarmed.yi" :),
                (: perform_action, "unarmed.hong" :),
                (: perform_action, "whip.qian" :),
                (: perform_action, "whip.fu" :),
                (: perform_action, "dodge.hua" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "recover" :),
        }) );

        setup();

        if (clonep())
        {
                ob = find_object(JIANSUO);
                if (! ob) ob = load_object(JIANSUO);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("/d/city/npc/cloth/fu-cloth")->wear();
        carry_object("/d/city/npc/cloth/jade-belt")->wear();
        carry_object("/d/city/npc/cloth/scarf")->wear();
        add_money("gold", 2);
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 65000)
        {
                command("say 我红花会乃为救天下苍生而建，所做的一切无不"
                        "以侠义为重。");
                command("say 阁下在德行方面，似乎还做得不够。");
                return;
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("say 你的江湖经验太浅，我就算收了你，恐怕你也难"
                        "有所作为。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 100)
        {
                command("say 你本门的内功心法都未练透，如何跟我习高深的"
                        "武学？");
                return;
        }

        if ((int)me->query("max_neili") < 2000)
        {
                command("say 我的武功全需强大的内功为辅，阁下似乎应该多"
                        "练练内力。");
                return;
        }

        command("nod");
        command("say 不错，不错。念在你如此有心，又乃我侠义中人，今日我便收下你。");
        command("say 希望阁下日后多行善事，为我红花会发扬壮大。");
        command("recruit " + me->query("id"));
}

int try_to_learn_quan()
{
        object me;
        object sob;
        int i;
        int flag;
        string *sub_skills;

        me = this_player();

        if (! me->query("can_learn/chen/baihua-cuoquan") &&
            me->query("family/master_id") != query("id"))
        {
                command("say 等你成为我的弟子后再说吧。");
                return -1;
        }

        if (me->query("shen") < 100000)
        {
                command("heng");
                command("say 我们红花会在江湖上行走，讲的就是“侠义”二字。");
                command("say 你连这都忘了，叫我如何敢传功于你？");
                return -1;
        }

        sob = find_object(SKILL_D("baihua-cuoquan"));
        if (! sob) sob = load_object(SKILL_D("baihua-cuoquan"));
        if (! sob->valid_learn(me))
                return 0;
        if (me->query_skill("baihua-cuoquan", 1))
        {
                command("say 咦？你不是已经会了么？自己下去好好练吧。");
                return -1;
        }

        sub_skills = keys(sob->query_sub_skills());
        flag = 0;
        for (i = 0; i < sizeof(sub_skills); i++)
        {
                if (me->query_skill(sub_skills[i], 1) >= 10)
                        continue;
                me->set_skill(sub_skills[i], 10);
                if (! flag)
                {
                        flag = 1;
                        command("say 不错！我现在将这套百花错拳传授与你，"
                                "下去后要好好练习，他日必能融会贯通！");
                }
                write(HIC "你对" + to_chinese(sub_skills[i]) + "有了一"
                      "些领悟。\n" NOR);
        }

        if (! flag)
        {
                command("say 嗯？我不是叫你下去后自己练习吗？");
                command("say 等你融会贯通之后再来找我吧。");
                return -1;
        }

        command("say 你自己下去练习吧，且记行走江湖，一切以侠义为重！");
        notify_fail("你自己下去好好练习吧。\n");
        return -1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jiandun-zhusuo/fu"))
                return "这招我不是早就传授给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("jiandun-zhusuo", 1) < 1)
                return "你连剑盾珠索都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 60000)
                return "你侠义正事做得不够，这招我不能传你。";

        if ((int)me->query("max_neili") < 600)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("jiandun-zhusuo", 1) < 50)
                return "你的剑盾珠索还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "\n听"
                       "后会心的一笑，看来大有所悟。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 这招很简单，稍微加以练习便成。");
        tell_object(me, HIC "你学会了「缚字诀」。\n" NOR);

        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("jiandun-zhusuo"))
                me->improve_skill("jiandun-zhusuo", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jiandun-zhusuo/fu", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jiandun-zhusuo/qian"))
                return "这招我不是早就传授给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("jiandun-zhusuo", 1) < 1)
                return "你连剑盾珠索都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1200)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 100000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("jiandun-zhusuo", 1) < 120)
                return "你的剑盾珠索还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "赞许地点了点头，道：“既"
                       "然你如此有心，今日\n我便传你此招。”$n" HIY "招"
                       "了招手，$N" HIY "连忙走上前去，只见\n$n" HIY "轻"
                       "声在$N" HIY "说了些话，接着手中长索一抖，登时幻"
                       "出漫\n天鞭影，宛如蛟龙通天，无数鞭影向四面八方劲"
                       "点而去。\n" NOR, me, this_object());

        command("smile");
        command("say 这招最是注重腕部的力道，下去后需勤加练习。");
        tell_object(me, HIC "你学会了「千头万绪」。\n" NOR);

        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("jiandun-zhusuo"))
                me->improve_skill("jiandun-zhusuo", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jiandun-zhusuo/qian", 1);
        me->add("gongxian", -1200);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhuangzi-wu/hua"))
                return "这招我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("zhuangzi-wu", 1) < 1)
                return "你连庄子舞都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 100000)
                return "你侠义正事做得不够，这招我不能传你。";

        if ((int)me->query_dex() < 32)
                return "你的身法灵动性不足，学不成这招。";

        if ((int)me->query("max_neili") < 2000)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("zhuangzi-wu", 1) < 150)
                return "你的庄子舞还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "微微一笑，对$N" HIY "点头道："
                       "“你今日有此造诣，传你这\n招，又有何难？”"
                       "说话随即一声清啸，身形一展，舞步宛如\n行云"
                       "流水、彩蝶飞扬般，速度变得异常敏捷。$N" HIY
                       "见得如此神\n妙的舞步，不禁赞叹不已。\n" NOR,
                       me, this_object());

        command("smile");
        command("say 这套庄子舞如有声乐配合施展，效果更佳。");
        tell_object(me, HIC "你学会了「化蝶」。\n" NOR);

        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("zhuangzi-wu"))
                me->improve_skill("zhuangzi-wu", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhuangzi-wu/hua", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/baihua-cuoquan/luan"))
                return "这招我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("baihua-cuoquan", 1) < 1)
                return "你连百花错拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 80000)
                return "你侠义正事做得不够，这招我不能传你。";

        if ((int)me->query("max_neili") < 2000)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("baihua-cuoquan", 1) < 120)
                return "你的百花错拳还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，说道：“我给"
                       "你演示一遍，可要仔细\n看好了。”说罢只见$n" HIY
                       "顿步沉身，双掌交错打出，掌锋\n拳影重重叠叠，虚"
                       "实难辨。\n" NOR, me, this_object());

        command("smile");
        command("say 这一招便是百花错乱，是以快打慢的上层拳术。");
        tell_object(me, HIC "你学会了「百花错乱」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("baihua-cuoquan"))
                me->improve_skill("baihua-cuoquan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/baihua-cuoquan/luan", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/baihua-cuoquan/yi"))
                return "这招我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("baihua-cuoquan", 1) < 1)
                return "你连百花错拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 100000)
                return "你侠义正事做得不够，这招我不能传你。";

        if ((int)me->query("max_neili") < 3000)
                return "你的内力修为不够，学不成这招。";

        if ((int)me->query_skill("force") < 280)
                return "你的内功修为不够，学不成这招。";

        if (me->query_skill("baihua-cuoquan", 1) < 150)
                return "你的百花错拳还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "微微一笑，说道：“看"
                       "好了！”只听$n" HIY "话音\n刚落，随即大喝一"
                       "声，双掌纷飞，擒拿手中夹着鹰爪功，左\n手查拳"
                       "，右手绵掌。攻出去八卦掌，收回时已是太极拳，"
                       "诸\n家杂陈，毫无规律，铺天盖地连续贯出。气势"
                       "恢弘，无与伦\n比。只看得$N" HIY "呆立当场，"
                       "不知所措。\n" NOR, me, this_object());

        command("smile");
        command("say 这百花错易的精妙便是一个“错”字，你下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「百花错易」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("baihua-cuoquan"))
                me->improve_skill("baihua-cuoquan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/baihua-cuoquan/yi", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/baihua-cuoquan/hong"))
                return "我已将拳诀尽数传予了你，还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("baihua-cuoquan", 1) < 1)
                return "你连百花错拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2500)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 150000)
                return "你侠义正事做得不够，这招我不能传你。";

        if ((int)me->query("max_neili") < 5000)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("baihua-cuoquan", 1) < 250)
                return "你的百花错拳还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("zhanshen-xinjing", 1) < 250)
                return "你的战神心经修为不够，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "微微一笑，叹道：“你"
                       "今日造诣非凡，确有能力\n继承我这拳法，我先将"
                       "总诀说予你听罢。方今之时，臣以神\n遇，而不以"
                       "目视，官知止而神欲行，依乎天理，批大却，导\n"
                       "大窍，因其固然……”$N" HIY "听得满脸迷茫，问"
                       "道：“师父，这\n…不是《庄子》中庖丁解……”"
                       "$n" HIY "笑道：“起初我也是\n这般的怀疑，但破"
                       "敌秘诀，却尽都在此。”说完便接着沉吟\n道：“"
                       "行为迟，动刀甚微，孑然已解，如土委地，提刀而"
                       "立，\n为之四顾，为之踌躇满志……”良久，良久"
                       "……。\n" NOR, me, this_object());

        command("smile");
        command("say 这本是我在玉峰上领悟的拳诀，今日传给了你，望你好自为之。");
        tell_object(me, HIC "你学会了「战神轰天诀」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("baihua-cuoquan"))
                me->improve_skill("baihua-cuoquan", 1500000);
        if (me->can_improve_skill("baihua-cuoquan"))
                me->improve_skill("baihua-cuoquan", 1500000);
        if (me->can_improve_skill("baihua-cuoquan"))
                me->improve_skill("baihua-cuoquan", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("zhanshen-xinjing"))
                me->improve_skill("zhanshen-xinjing", 1500000);
        if (me->can_improve_skill("zhanshen-xinjing"))
                me->improve_skill("zhanshen-xinjing", 1500000);
        if (me->can_improve_skill("zhanshen-xinjing"))
                me->improve_skill("zhanshen-xinjing", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/baihua-cuoquan/hong", 1);
        me->add("gongxian", -2500);

        return 1;
}

mixed ask_jiansuo()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_bad())
        {
                if (me->query("family/family_name") == "红花会")
                        message_vision(CYN "$N" CYN "冷哼一声，对$n" CYN "道："
                                       "“你行为如此不耻，居然还敢来问我要剑盾"
                                       "珠索？”\n" NOR, this_object(), me);
                else
                        message_vision(CYN "$N" CYN "冷笑一声，对$n" CYN "说道"
                                       "：“好一个奸恶之徒，竟敢贪图我的随身利"
                                       "器！”\n" NOR, this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "红花会")
                return "你又不是我们红花会的兄弟，打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能用我这剑盾珠索。";

        if (me->query("shen") < 80000)
                return "你侠义正事做得还不够，这剑盾珠索我不能教给你。";

        if (me->query_skill("jiandun-zhusuo", 1) < 120)
                return "你连剑盾珠索都没学好，就算用也是白搭。";

        ob = find_object(JIANSUO);
        if (! ob) ob = load_object(JIANSUO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "剑盾珠索现在不就在你手里吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，剑盾珠索我已经借出去了。";

                if (owner->query("family/family_name") == "红花会")
                        return "剑盾珠索现在是我们红花会的" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的剑盾珠索现在落入了" + owner->query("name") +
                               "之手，你去把它取回来吧！";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "微微一笑，道：“这剑盾珠索你就"
                       "拿去，多用它行侠仗义，惩奸除恶。”\n" NOR,
                       this_object(), me);
        command("give jiandun zhusuo to " + me->query("id"));
        return 1;
}
