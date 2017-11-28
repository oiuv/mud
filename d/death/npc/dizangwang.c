// dizangwang

#include <ansi.h>
#define QILIN_XUE    "/d/death/obj/qilinxue"

inherit NPC;

mixed ask_xue();
mixed ask_zhuan();

void create()
{
        set_name("地藏王", ({ "dizang", }));
        set("long", "他容貌威严，不可一世。哇！他可是掌管人间生死的神仙。\n");
        set("gender", "男性");
        set("age", 99);
        set("attitude", "peaceful");
        set("shen_type", 0);
        set("per", 18);
        set("attitude", "peaceful");
        set("str", 31);
        set("int", 39);
        set("con", 34);
        set("dex", 36);

        set("max_qi", 9999);
        set("max_jing", 9999);
        set("neili", 9999);
        set("max_neili", 9999);
        set("jiali", 200);

        set("combat_exp", 50000000);
                
        set_skill("unarmed", 800);
        set_skill("finger", 800);
        set_skill("parry", 800);
        set_skill("dodge", 800);
        set_skill("force", 800);
        set_skill("sword", 800);
        set_skill("count", 800);
        set_skill("kuihua-mogong", 800);
        set_skill("martial-cognize", 800);
        set_skill("literate", 220);

        map_skill("parry", "kuihua-mogong");
        map_skill("force", "kuihua-mogong");
        map_skill("dodge", "kuihua-mogong");
        map_skill("finger", "kuihua-mogong");
        map_skill("sword", "kuihua-mogong");

        prepare_skill("finger", "kuihua-mogong");     
           
        set("inquiry", ([
                "麒麟靴" : (: ask_xue :),
                "转世"   : (: ask_zhuan :),                
        ]));
        
        setup();
        carry_object("/clone/cloth/cloth.c")->wear();
        carry_object("/clone/misc/spin")->wield();
                
        create_family("冥府地藏王殿前", 1, "幽冥之主");
        set("title", HIR "幽冥之主" NOR);
}

int attempt_apprentice(object ob)
{
        if (! ob->query("born"))
        {
                command("say 你快投胎去，在这里瞎搅和什么？");
                return 0;
        }

        command("say 滚！给我一边儿去！");
}

mixed ask_xue()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (! me->query("hell_quest/锁阳丹"))
                return "麒麟靴是我的宝物，你打听它干什么？";

        ob = find_object(QILIN_XUE);
        if (! ob) ob = load_object(QILIN_XUE);
	owner = environment(ob);
        while (owner)
	{
                if (owner->is_character() || ! environment(owner))
                        break;
		owner = environment(owner);
	}

        if (owner == me)
                return "麒麟靴不是在你的手中么，怎么反而来找我呢？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "我已经把麒麟靴借出去了。";

                        return "麒麟靴现在落在" + owner->query("name") +
                               "手中，你去把他找回来吧。";
        }

        ob->move(this_object());
        message_vision("$N点点头道：“好，既然你是为了老夫的锁阳丹之事，老夫就借给你吧！”\n", 
                       this_object(), me);
        command("give boots to " + me->query("id"));
        return 1;
}

mixed ask_zhuan()
{
        object who;
        
        who = this_player();
        /*
        if ((int)who->query("combat_exp") < 800000000 || 
            ! ultrap(who)) 
        {
                message_vision("$N对$n一拱手，道：经验不够，技能不熟，强求亦是枉然。\n", 
                               this_object(), who);
                return 1;
        }
        
        if (! who->query("animaout")) 
        {
                message_vision("$N对$n一拱手，道：你还没有打通过生死玄关呢。\n", 
                               this_object(), who);
                return 1;
        }
        */
        if (! who->query("HellZhenPass"))
        {
                message_vision("$N对$n一拱手，道：你想转世先过了十八层地狱这一关再说！\n", 
                               this_object(), who);
                return 1;
        }
        
        if (who->query("SkyPass"))
        {
                message_vision("$N对$n一拱手，道：精元丹你取来了吗？取来了就快给我！\n", 
                               this_object(), who);
                return 1;
        }
     
        message_vision("$N对$n阴阴地笑了几声，说：天堂有路你不走，地狱无门你闯进来。\n",
                       this_object(), who);         

        message("channel:rumor", HIB "【阴曹地府】" + who->query("name") +
                "要闯幽冥地府考验最后一关，哼！等着收尸吧！\n" NOR, users());                                          
        
        environment(this_object())->set("no_fight", 0);
        competition_with(who);
        this_object()->fight_ob(who);
        who->fight_ob(this_object());
        
        return 1;
}

void fight_ob(object ob)
{
        if (is_fighting(ob))
                return;

        message_vision(HIB "$N" HIR "一声暴喝，身后"
                       "登时腾起无数冤魂，一齐恸哭哀嚎。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
}

void win()
{
        object ob;
        if (! objectp(ob = query_competitor()))
                return;

        message_vision(HIB "$N看了看$n，嘿嘿笑道：“你知道你打不败我意味着什么吗？"
                       "就意味着死亡！哈哈！！！”\n" NOR,
                       this_object(), ob);
                       
        call_out("ob_die", 1, ob);  
        environment(this_object())->set("no_fight", 1); 
        ::win();
}

void ob_die(object me)
{
        me->set_temp("die_reason", "被地藏王给活活杀死了");
        me->die();       
}

void lost()
{
        object ob;
        if (! objectp(ob = query_competitor()))
                return;

        message_vision(HIB "$N哎呀一声，对$n怒道：“这次算你侥幸，下次可没有这么便宜了！”\n" NOR,
                       this_object(), ob);
        message_sort(HIB "$N说完从怀里掏出生死薄，拿出判官笔在上面勾画一会，完毕对$n说道："
                     "想转世过了我这关还不够，你须得进入十二重天将精元丹取来，我方能帮"
                     "你打开转世之门！十二重天把守森严，老夫只能助你到天门，其他的路靠"
                     "你自己闯了！\n" NOR, this_object(), ob);
        ob->set("DiZangPass", 1);
        ob->move("/d/death/sky/tianmen");
        environment(this_object())->set("no_fight", 1);
        message("channel:rumor", HIB "【阴曹地府】恭喜" + ob->query("name") +
                "闯过幽冥地府考验，闯入天界十二重天！\n" NOR, users());             
                
        ::lost();
}

int accept_kill(object ob)
{
        return 0;
}

int accept_hit(object ob)
{
        return 0;
}

int accept_object(object me, object ob)
{
       //object obn;

        if ( !me || environment(me) != environment() ) return 0;
        if ( !objectp(ob) ) return 0;
        if ( !present(ob, me) ) return notify_fail("你没有这件东西。\n");

        if ( (string)ob->query("id") != "jingyuan dan" )
        {
                message_vision(CYN "地藏王摇了摇头，道：你给我这个干什么？\n" NOR, me);
                return 0;
        }

        if (! me->query("SkyPass") || ! me->query("DiZangPass"))
        {
                message_vision(CYN "地藏王道：无功不受禄，这个你还是自己留着吧。\n"
                               NOR, me);
                return 0;
        }
        
        message_vision(CYN "地藏王道：很好很好！没有想到你连十二重天这一关也过了，这是天意。\n"
                       "老夫也只能顺天意而行了，去吧。\n"
                       NOR, me);
                       
        message_vision(CYN "地藏王随手一招，突然刮起一阵阴风，精元丹护住你的元神帮你进入六道轮回。\n"
                       NOR, me);

        message("channel:rumor", HIB "【阴曹地府】恭喜" + me->query("name") +
                "闯过天界十二重天，进入六道轮回时空，天意？人为？！！！\n" NOR, users());                             
              
        destruct(ob);
        
        me->move("/d/death/liudaolunhui/tiandao");
        me->move("/d/death/liudaolunhui/diyudao");
        me->move("/d/death/liudaolunhui/rendao");
        me->move("/d/death/liudaolunhui/eguidao");
        me->move("/d/death/liudaolunhui/chushengdao");
        me->move("/d/death/liudaolunhui/xiuluodao");
        me->move("/d/death/liudaolunhui/wujiandao");
        
        return 1;
}
