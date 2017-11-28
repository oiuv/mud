#include <ansi.h>

inherit NPC;

void create()
{
        set_name("阿大", ({ "a da", "a", "da" }));
        set("long", "八臂神剑方东白是丐帮四大长老之首，剑术\n"
                    "之精，名动江湖，只因他出剑奇快，有如生\n"
                    "了七八条手臂一般，因此上得了这个外号。\n"
                    "十多年前听说他身染重病身亡，当时人人都\n"
                    "感惋惜，不觉他竟尚在人世。\n");
        set("title", "丐帮四大长老之首");
        set("nickname", HIW "八臂神剑" NOR);
        set("gender", "男性");
        set("age", 68);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("per", 20);
        set("str", 45);
        set("int", 45);
        set("con", 45);
        set("dex", 45);
        
        set("max_qi", 5500);
        set("max_jing", 2000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 2000000);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.kuang" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        set_skill("literate", 180);
        set_skill("begging", 200);
        set_skill("checking", 200);
        set_skill("force", 270);
        set_skill("dodge", 270);
        set_skill("unarmed", 270);
        set_skill("parry", 270);
        set_skill("strike", 270);
        set_skill("sword", 270);
        set_skill("feiyan-zoubi", 270);
        set_skill("huntian-qigong", 270);
        set_skill("kuangfeng-jian", 270);
        set_skill("dragon-strike", 270);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "huntian-qigong");
        map_skill("strike", "dragon-strike");
        map_skill("parry", "kuangfeng-jian");
        map_skill("sword", "kuangfeng-jian");

        prepare_skill("strike", "dragon-strike");

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        add_action("begin","bi");
}

int accept_fight(object who)
{
        command("say 没郡主的吩咐我不会出手。");
        return 0;
}

int accept_hit(object who)
{
        command("say 没郡主的吩咐我不会出手。");
        return 0;
}

int accept_kill(object who)
{
        command("say 没郡主的吩咐我不会出手，杀了我也一样。");
        return notify_fail("刹那间你只觉得下不了手。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见楼上人影晃动，根本看不清楚。\n");
}

int begin()
{
        object weapon, env, shelf, sword;
        object me=this_player();
        object obj=this_object();
        env = environment(this_object());
        shelf = present("shelf", env);
        sword = present("yitian sword", shelf);


        if (objectp(present("a er", environment())))
        return 0;

        if (! me->query_temp("win_aer"))
        {
                command("heng");
                command("say 阁下是谁？为何刚才不出战，现在来趁机拣便宜。");
                return notify_fail("看起来阿大并不想跟你较量。\n");
        }

        if (! objectp(weapon = me->query_temp("weapon")))
        {
                command("say 我只和你比兵器功夫！");
                return notify_fail("看起来阿大并不想跟你较量。\n");
        }

        if (sword)
        {
                command("nod");
                command("bow");

                message_vision(CYN "突然赵敏喝道：“慢着！拿着倚天剑和$n" CYN
                                   "斗！”\n" NOR,
                                   obj, this_player());

                message_vision(CYN "阿大微微点了点头，道：“遵命！”\n\n" NOR,
                                   obj, this_player());

                message_vision(CYN "阿大躬身上前，轻轻在" NOR+RED 
                                   "红木剑架" NOR+CYN
                                   "上一拍，那号称天下第一神兵的" NOR+WHT
                                   "倚天剑" NOR+CYN
                                   "顿时凌空跃起，飞如阿大手中。\n\n" NOR,
                                   obj, this_player());

                message_vision(HIW "只听“嗖”的一声破空声响，号称天下第一神兵的倚天剑已被阿大握在手中。\n\n" NOR,
                                   this_object(),this_player());

                sword->move(this_object());
                sword->wield();

                command("say 进招了。");

                message_vision(HIR "阿大仰天一声清啸，手中倚天剑寒芒顿时爆涨数倍，“刷刷刷刷”连续数剑，向$n" HIR 
                                   "各处要害连续刺去！\n身法之快，剑法之高明，的确世所罕见。\n\n" NOR,
                                   this_object(),this_player());
        }

        call_out("do_unwield",3);
        me->set_temp("bi",1);
        set("anti",me);
        obj->kill_ob(this_player());
        this_player()->kill_ob(obj);
        return 1;
}

void unconcious()
{
        object ob;
        object me = this_player();

        if (objectp(query("anti")))
        {
                message_vision(HIR "\n$n" HIR 
                                   "暗自摸索阿大剑招中的破绽，手中兵器挥洒，将阿大手中的倚天剑牢牢圈住，"
                                   "阿大顿感不妙，刚要撤剑回\n防，只觉胸口一阵冰凉，$n" HIR 
                                   "的剑身已经贯胸而入。\n\n" NOR,
                                   this_object(),query("anti"));

                message_vision(HIR "$n" HIR
                                   "得势不饶人，紧接着连攻出数剑，将阿大全身各处筋脉尽数削断。\n\n" NOR,
                                   this_object(),query("anti"));

                message_vision(CYN "\n赵敏一张俏脸顿时惨白，叹了口气，说道：“很好，这倚天剑你就拿去吧！”\n" NOR,
                                   this_object());

                message_vision(CYN "赵敏对着$n" CYN 
                                   "嫣然一笑，随即轻轻伸了伸腰，轻声说道：“鹿先生，鹤先生，我累了。”\n" NOR,
                                   this_object(), query("anti"));

                message_vision(HIR "只见赵敏身后闪出两个人影，相互使了个眼神，二话不说，对着$n" HIR 
                                   "直扑过来。”\n" NOR,
                                   this_object(), query("anti"));

                query("anti")->delete_temp("bi");
                query("anti")->delete_temp("win_he");
                query("anti")->delete_temp("win_asan");
                query("anti")->delete_temp("win_aer");

                ob = new("/d/tulong/yitian/npc/hebiweng");
                ob->move("/d/tulong/yitian/was_lou4");
                if (objectp(ob)) ob->kill_ob(me);

                ob = new("/d/tulong/yitian/npc/luzhangke");
                ob->move("/d/tulong/yitian/was_lou4");
                if (objectp(ob)) ob->kill_ob(me);

                ob = present("zhao min");
                if (objectp(ob)) destruct(ob);

        }
        ::die();
}

