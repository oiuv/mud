#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_jian();
mixed ask_zhen();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

#define BAILONG    "/clone/lonely/bailongjian"

void create()
{
        object ob;
        set_name("陆菲青", ({ "lu feiqing", "lu", "feiqing" }));
        set("long", "陆菲青，乃武当派大侠，壮年时在大江南北\n"
                    "行侠仗义，端的名震江湖。至屠龙帮瓦解冰\n"
                    "消，陆菲青远走边疆，当时清廷曾四下派人\n"
                    "追拿，但他为人机警，兼之武功高强，得脱\n"
                    "大难，但清廷继续严加查缉。\n");
        set("nickname", HIW "绵里针" NOR);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 62);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 23);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 6000);
        set("max_jing", 5000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 200);
        set("combat_exp", 4000000);
        set("score", 500000);

        set_skill("force", 260);
        set_skill("taiji-shengong", 260);
        set_skill("unarmed", 240);
        set_skill("xuangong-quan", 240);
        set_skill("dodge", 240);
        set_skill("tiyunzong", 240);
        set_skill("sword", 240);
        set_skill("rouyun-jian", 240);
        set_skill("taiji-jian", 240);
        set_skill("parry", 240);
        set_skill("throwing", 240);
        set_skill("furong-jinzhen", 240);
        set_skill("martial-cognize", 220);
        set_skill("literate", 220);

        map_skill("force"  , "taiji-shengong");
        map_skill("sword"  , "rouyun-jian");
        map_skill("unarmed" , "xuangong-quan");
        map_skill("dodge"  , "tiyunzong");
        map_skill("parry"  , "taiji-jian");
        map_skill("throwing"  , "furong-jinzhen");

        prepare_skill("unarmed", "xuangong-quan");

        set("inquiry", ([
                "芙蓉金针"   : (: ask_zhen :),
                "白龙剑"     : (: ask_jian :),
                "金针现影"   : (: ask_skill1 :),
                "三环套月"   : (: ask_skill2 :),
                "玄功无极劲" : (: ask_skill3 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.xuan" :),
                (: perform_action, "sword.tao" :),
                (: perform_action, "throwing.xian" :),
                (: exert_function, "shield" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        create_family("武当派", 17, "掌门");

        set("zhen_count", 3);

        setup();

        if (clonep())
        {
                ob = find_object(BAILONG);
                if (! ob) ob = load_object(BAILONG);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/changjian");
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("/d/wudang/obj/greyrobe")->wear();
        set_temp("handing", carry_object("/d/kaifeng/npc/obj/jinzhen"));
}

void attempt_apprentice(object ob)
{
        command("sigh");
        command("say 我不收徒，若要拜师你直接去武当山好了。");
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "红花会" &&
           ob->query("family/family_name") != "武当派")
        {
                command("hmm");
                command("say 贫道与阁下素无渊源，何谈传授二字？\n");
                return -1;
        }

        if (ob->query("family/family_name") == "武当派")
        {
                command("sigh");
                command("say 我已经说过我不收徒了，这些你还是去找你师父学吧。\n");
                return -1;
        }

        if (ob->query("family/master_id") != "chen jialuo" &&
           ob->query("family/master_id") != "wuchen daozhang" &&
           ob->query("family/master_id") != "zhao banshan")
        {
                command("say 贫道与阁下不甚相熟，功夫还是找你师父学去吧。\n");
                return -1; 
        }

        if ((int)ob->query("shen") < 50000)
        {
                command("hmm");
                command("say 我素来敬佩红花会的好汉，但阁下的德行似乎不怎么样。");
                return -1;
        }

        if (skill != "sword" && skill != "rouyun-jian" &&
           skill != "unarmed" && skill != "xuangong-quan" &&
           skill != "throwing" && skill != "furong-jinzhen")
        {
                command("shake");
                command("say 我只传授你一些剑法、拳脚和暗器的功夫，其它还是找你师父学吧。");
                return -1;
        }

        if (skill == "sword" && ob->query_skill("sword", 1) > 179)
        {
                command("say 你的剑法造诣已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (skill == "unarmed" && ob->query_skill("unarmed", 1) > 179)
        {
                command("say 你的拳脚功夫已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (skill == "throwing" && ob->query_skill("throwing", 1) > 179)
        {
                command("say 你的暗器手法已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/lufeiqing"))
        {
                command("say 现在大敌当前，我也顾不了武当派的什么门规了。");
                command("say 这柔云剑法、无极玄功拳及芙蓉金针是我生平绝学，就传给你好了。");
                ob->set_temp("can_learn/lufeiqing", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/furong-jinzhen/xian"))
                return "自己下去练，能教的我都尽数教给你了。";

        if (me->query("family/family_name") != "红花会" &&
           me->query("family/family_name") != "武当派")
                return "贫道与阁下素无渊源，不知阁下这话从何而来？";

        if (me->query_skill("furong-jinzhen", 1) < 1)
                return "你连芙蓉金针都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "嗯，你对" + me->query("family/family_name") + CYN
                       "所作的贡献不够，这招我不传你。";

        if (me->query("shen") < 30000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候不足，用不了这一招！";

        if (me->query_skill("furong-jinzhen", 1) < 80)
                return "你芙蓉金针尚未修炼得精深，难以运用此招。";

        message_vision(HIY "$n" HIY "对$N" HIY "笑了笑，俯身从腰囊"
                       "中拈出一根金针，轻轻弹出，顿时只\n听“飕”"
                       "的一声，金针化作一道金芒，没入$N" HIY "脚"
                       "跟前的青石地，只留\n下一个小孔。\n" NOR,
                       me, this_object());

        command("nod");
        command("say 要诀都记住了吗？剩下就靠你自己练了。");
        tell_object(me, HIC "你学会了「金针现影」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("furong-jinzhen"))
                me->improve_skill("furong-jinzhen", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/furong-jinzhen/xian", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/rouyun-jian/tao"))
                return "这招你不是已经学会了吗？";

        if (me->query("family/family_name") != "红花会" &&
           me->query("family/family_name") != "武当派")
                return "贫道与阁下素无渊源，不知阁下这话从何而来？";

        if (me->query_skill("rouyun-jian", 1) < 1)
                return "你连柔云剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 700)
                return "嗯，你对" + me->query("family/family_name") + CYN
                       "所作的贡献不够，这招我不传你。";

        if (me->query("shen") < 60000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("dodge") < 180)
                return "你的轻功修为不够，用不了这一招！";

        if (me->query_skill("rouyun-jian", 1) < 140)
                return "你柔云剑法尚未修炼得精深，难以运用此招。";

        message_vision(HIY "$n" HIY "微微一笑，从怀中轻轻取出了一本"
                       "剑谱，指着其中一段对$N" HIY "细\n说良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());

        command("nod");
        command("say 这些全都是三环套月的精妙所在，你下去慢慢练吧。");
        tell_object(me, HIC "你学会了「三环套月」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("rouyun-jian"))
                me->improve_skill("rouyun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/rouyun-jian/tao", 1);
        me->add("gongxian", -700);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xuangong-quan/xuan"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != "红花会" &&
           me->query("family/family_name") != "武当派")
                return "贫道与阁下素无渊源，不知阁下这话从何而来？";

        if (me->query_skill("xuangong-quan", 1) < 1)
                return "你连无极玄功拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "嗯，你对" + me->query("family/family_name") + CYN
                       "所作的贡献不够，这招我不传你。";

        if (me->query("shen") < 50000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 160)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("xuangong-quan", 1) < 120)
                return "你无极玄功拳尚未修炼得精深，难以运用此招。";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会心\n的一笑，看来大有所悟。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 刚才的话你都需记牢了，自己下去慢慢练吧。");
        tell_object(me, HIC "你学会了「玄功无极劲」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("xuangong-quan"))
                me->improve_skill("xuangong-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuangong-quan/xuan", 1);
        me->add("gongxian", -400);
        return 1;
}

mixed ask_zhen()
{
        object me;
        object ob;

        me = this_player();

        if (me->is_bad())
                return "你这邪魔外道，还不快快给贫道滚开。";

        if (me->query("family/family_name") != "红花会" &&
           me->query("family/family_name") != "武当派")
                return RANK_D->query_respect(me) + "与贫道素不相识，不知"
                       "此话何解？";

        if (me->query_skill("furong-jinzhen", 1) < 80)
                return "你芙蓉金针的手法还不到家，拿了芙蓉金针也没什么用。";

        if (query("zhen_count") < 1)
                return "我又不是卖这个的，哪里带得了这么多。";

        add("zhen_count", -1);
        ob = new("/d/kaifeng/npc/obj/jinzhen");
        message_vision("$N拿出五十根" HIY "芙蓉金针" NOR "(Furong jinzhen)给$n。\n",
                       this_object(), me);
        ob->move(me, 1);
        return "既然这样，我这儿的芙蓉金针你就先拿去用吧。";
}

mixed ask_jian()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_bad())
        {
                if (me->query("family/family_name") == "红花会")
                        message_vision(CYN "$N" CYN "冷哼一声，对$n" CYN "道："
                                       "“你若再敢在我面前说三道四，小心我替红"
                                       "花会清除你这个败类！”\n" NOR,
                                       this_object(), me);
                else
                if (me->query("family/family_name") == "武当派")
                        message_vision(CYN "$N" CYN "冷哼一声，对$n" CYN "道："
                                       "“你身在武当，行为却如此不耻，竟还敢在"
                                       "我面前说三道四！”\n" NOR,
                                       this_object(), me);
                else
                        message_vision(CYN "$N" CYN "冷笑一声，对$n" CYN "说道"
                                       "：“阁下什么来头？居然敢打听陆某的配剑"
                                       "？”\n" NOR,
                                       this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") == "武当派")
                return "你虽和我同在武当，但这配剑是我随身之物，现大敌当前，不便交予。";

        if (me->query("family/family_name") != "红花会")
                return "贫道与阁下素不相识，不知阁下无故打听在下的配剑究是为何？";

        if (me->query("family/master_id") != "chen jialuo" &&
           me->query("family/master_id") != "wuchen daozhang" &&
           me->query("family/master_id") != "zhao banshan")
                return "我与你师父不熟，这白龙剑不能交给你。";

        if (me->query("shen") < 30000)
                return "学武之人，自应以德义为先。我的配剑不会随便给人，你走吧。";

        if (me->query_skill("rouyun-jian", 1) < 150)
                return "你还是先在贫道这里把柔云剑法练成之后再说吧。";

        ob = find_object(BAILONG);
        if (! ob) ob = load_object(BAILONG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？贫道的白龙宝剑不就在你身上吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我的配剑已经让别人取去了。";

                if (owner->query("family/family_name") == "武当派")
                        return "我的配剑现在在我武当门人" + owner->query("name") +
                               "手中，你要用就去找他吧。";
                else
                if (owner->query("family/family_name") == "红花会")
                        return "我的配剑被你们红花会的" + owner->query("name") +
                               "取去了，你要用就去找他吧。";
                else
                        return "我的配剑现在落到了" + owner->query("name") +
                               "手中，你去找他吧！";
        }
        ob->move(this_object());

        ob = new("/clone/weapon/changjian");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "叹道：“配剑你拿去吧，但切记行走"
                       "江湖侠义为重，莫坏了红花会的名声。”\n" NOR,
                       this_object(), me);
        command("give bailong jian to " + me->query("id"));
        return 1;
}
