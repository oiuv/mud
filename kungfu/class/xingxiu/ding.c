// ding.c 丁春秋

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

#include "xingxiu.h"
#include <ansi.h>

string ask_me();
string ask_du1();
string ask_du2();
string ask_xiangliao();

#define SUO "/clone/lonely/rousisuo"

void create()
{
        set_name("丁春秋", ({ "ding chunqiu", "ding" }));
        set("nickname", HIG "星宿老怪" NOR);
        set("long", @LONG
他就是星宿派开山祖师、令正派人士深恶痛绝的星宿老怪丁春秋。
可是他看起来形貌清奇，仙风道骨。
LONG );
        set("gender", "男性");
        set("age", 60);
        set("attitude", "friendly");
        set("class", "scholar");
        set("shen_type", -1);
        set("str", 25);
        set("int", 30);
        set("con", 38);
        set("dex", 38);
        
        set("max_qi", 6400);
        set("max_jing", 2900);
        set("neili", 7300);
        set("max_neili", 7300);
        set("jiali", 120);
        set("combat_exp", 3850000);

        set_skill("force", 260);
        set_skill("huagong-dafa", 260);
        set_skill("guixi-gong", 260);
        set_skill("throwing", 240);
        set_skill("feixing-shu", 240);
        set_skill("dodge", 240);
        set_skill("zhaixing-gong", 240);
        set_skill("strike", 260);
        set_skill("chousui-zhang", 260);
        set_skill("claw", 240);
        set_skill("sanyin-wugongzhao", 240);
        set_skill("whip", 240);
        set_skill("chanhun-suo", 240);
        set_skill("parry", 240);
        set_skill("staff", 240);
        set_skill("poison", 260);
        set_skill("tianshan-zhang", 240);
        set_skill("literate", 200);
        set_skill("medical", 260);
        set_skill("xingxiu-qishu", 260);

        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixing-gong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("whip", "chanhun-suo");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");
        map_skill("poison", "xingxiu-qishu");
        map_skill("throwing", "feixing-shu");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        set("book_count", 1);
        set("zhen_count", 1);
        set("san_count", 1);
        set("xiangliao_count", random(10) + 10);

        set("inquiry", ([
                "毒经"       : (: ask_me :),
                "星宿毒经"   : (: ask_me :),
                "碧磷针"     : (: ask_du1 :),
                "香料"       : (: ask_xiangliao :),
                "逍遥三笑散" : (: ask_du2 :),
                "神木王鼎"   : "哼，你休想打它的注意，小心我一掌毙了！\n",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                //(: perform_action, "staff.fugu" :),
                //(: perform_action, "staff.xue" :),
                //(: perform_action, "strike.tao" :),
                (: perform_action, "strike.dan" :),
                (: perform_action, "strike.tao" :),
                (: perform_action, "strike.shi" :),
                (: perform_action, "claw.zhua" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        create_family("星宿派", 1, "开山祖师");
        set("class", "taoist");

        set_temp("apply/damage", 180);
        set_temp("apply/armor", 400);
        set_temp("apply/attack", 250);
        set_temp("apply/dodge", 250);
        set_temp("apply/parry", 250);

        setup();
        //carry_object("/clone/weapon/gangzhang")->wield();
        carry_object("/clone/cloth/cloth")->wear();
        //set_temp("handing", carry_object("/clone/misc/duwan"));

}

void init()
{
        object me;

        me = this_player();

        if (! interactive(me))
                return;

        if (living(this_object()) && present("shenmu wangding", me))
        {
                command("say 好家伙，原来你偷了我的神木王鼎！受死吧！");
                kill_ob(me);
                return;
        }

        add_action("do_flatter", "flatter");
}

void attempt_apprentice(object me)
{

        if ((int)me->query("shen") > -12000)
        {
                command("say 老仙我越看你越象白道派来卧底的。");
                return;
        }

        if ((int)me->query("combat_exp") < 300000)
        {
                command("say 你这点微末道行如何能学到老仙的神妙功夫。");
                return;
        }

        if (me->query_skill("chousui-zhang", 1) < 120)
        {
                command("say 你抽髓掌都没熟练，居然还有脸来见我？");
                return;
        }

        if ((int)me->query_skill("poison", 1) < 120)
        {
                command("say 你毒技都没学明白，还有脸来见我？");
                return;
        }

        if( me->query_temp("pending/flatter"))
        {
                command("say 你如此不把老仙放在眼里，老仙怎会收你？");
                return;
        } else
        {
                command("say 我星宿老仙比起古往今来的圣人怎么样啊？");
                message_vision("星宿老怪微闭双眼，手捻长须，一副等人拍马(flatter)的样子。\n",
                this_player());
                me->set_temp("pending/flatter", 1);
        }
}

int do_flatter(string arg)
{
        if (! this_player()->query_temp("pending/flatter"))
                return 0;

        if (! arg) return notify_fail("你说老仙什么？\n");
        this_player()->set_temp("pending/flatter", 0);
        message_vision("$N大声说道：" + arg + "\n", this_player());
        if( strsrch(arg, "星宿老仙") >=0 && (strsrch(arg, "德配天地") >=0
         || strsrch(arg, "威震寰宇") >=0 || strsrch(arg, "古今无比") >=0 )) {
                command("smile");
                command("say 这还差不多。\n");
                welcome(this_player());
                command("recruit " + this_player()->query("id"));
        } else
        {
                command("say 你如此不把我放在眼里，我怎能收你？");
        }
        return 1;
}

// 星宿老仙，德配天地，威震寰宇，古今无比
string ask_me()
{
        mapping fam; 
        object ob;
        
        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (query("book_count") < 1)
                return "你来晚了，本派的内功心法不在此处。\n";

        add("book_count", -1);
        ob = new("/clone/book/dujing_2");
        ob->move(this_player());
        return "好吧，这本「星宿毒经」你拿回去好好钻研。\n";
}

string ask_du1()
{
        mapping fam; 
        object ob;
        
        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (this_player()->query_skill("poison", 1) < 50)
                return "你的毒技火候未到，用不了这种东西。\n";

        if (query("zhen_count") < 1)
                return "你来晚了，碧磷针都发完了。\n";

        add("zhen_count", -1);
        ob = new("/d/xingxiu/obj/bilinzhen");
        ob->move(this_player());
        return "好吧，那你就先用这些针吧。\n";
}

string ask_du2()
{
        mapping fam; 
        object ob;
        
        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (this_player()->query_skill("poison", 1)<100)
                return "你的毒技火候未到，用不了这种东西。\n";

        if (query("san_count") < 1)
                return "你来晚了，现在没什么剩的了。\n";

        add("san_count", -1);
        ob = new("/d/xingxiu/obj/sanxiaosan");
        ob->move(this_player());
        return "好吧，这包毒药你拿回去善加利用吧。\n";
}

string ask_xiangliao()
{
        mapping fam;
        object ob;

        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (is_busy() || is_fighting())
                return "等会儿，没看我这正忙着呢么？\n";

        if (this_player()->query_temp("get_xiangliao"))
                return "刚才不是给了你吗？不会这么快就用完了吧？\n";

        if (this_player()->query_skill("poison", 1) < 40)
                return "你的毒技火候太差，还是练练再说吧！\n";

        if (query("xiangliao_count") < 1)
                return "你来晚了，现在没什么剩下的香料了，你还是去仓库找找看吧！\n";

        add("xiangliao_count", -1);
        ob = new("/clone/misc/xiangliao");
        ob->set_amount(random(50) + 100);
        ob->move(this_player());
        start_busy(2);
        this_player()->set_temp("get_xiangliao", 1);
        call_out("clear_xiangliao_flag", 180);
        return "好吧，这些香料你拿去慢慢用吧。\n";
}

void reset()
{
        set("xiangliao_count", random(10) + 10);
}

void unconcious()
{
        die();
}

int accept_ask(object me, string topic)
{
        switch(topic)
        {
             case "历练" :
             case "历炼" :
             case "锻炼" :
                 return QUEST_D->accept_ask(this_object(), me, topic);

             case "夺魂势":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/chanhun-suo/duo",
                                 "name"     :  "夺魂势",
                                 "sk1"      :  "chanhun-suo",
                                 "lv1"      :  100,
                                 "sk2"      :  "force",
                                 "lv2"      :  130,
                                 "shen"     :  -10000,
                                 "gongxian" :  80,
                                 "force"    :  80 ]));
                  break;

             case "炼心弹":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/chousui-zhang/dan",
                                 "name"     :  "炼心弹",
                                 "sk1"      :  "chousui-zhang",
                                 "lv1"      :  140,
                                 "sk2"      :  "force",
                                 "lv2"      :  140,
                                 "sk3"      :  "poison",
                                 "lv3"      :  140,
                                 "sk4"      :  "throwing",
                                 "lv4"      :  140,
                                 "shen"     :  -22000,
                                 "neili"    :  1800,
                                 "gongxian" :  950 ]));
                  break;

             case "碧焰滔天":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/chousui-zhang/tao",
                                 "name"     :  "碧焰滔天",
                                 "sk1"      :  "chousui-zhang",
                                 "lv1"      :  220,
                                 "sk2"      :  "poison",
                                 "lv2"      :  250,
                                 "sk3"      :  "huagong-dafa",
                                 "lv3"      :  220,
                                 "shen"     :  -38000,
                                 "neili"    :  3000,
                                 "gongxian" :  1200 ]));
                  break;
   
             case "柔丝索" :
                return MASTER_D->give_item(me, this_object(),
                               (["item"     :  SUO,
                                 "master"   :  1,
                                 "sk1"      :  "chanhun-suo",
                                 "lv1"      :  140,
                                 "shen"     :  -30000 ]));
                  break;
                               
             default : 
                  return 0;
                           
        }
}

void clear_xiangliao_flag()
{
        if (this_player()->query_temp("get_xiangliao"))
               this_player()->delete_temp("get_xiangliao");
      
        return;
}