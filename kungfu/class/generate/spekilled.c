/* person used in quest */

#include <ansi.h>

inherit CLASS_D( "generate" ) + "/chinese";


#define WAITING     1
#define ATTACKING   2
#define OVER        3
#define GO_CMD      "/cmds/std/go"

void random_move();


int leave();


int  is_stay_in_room()
{
    return(1);
}


mapping fam_info;

int filter_listener( object ob )
{
    if ( ob->query( "env/no_story" ) )
        return(0);
    return(1);
}


void create()
{
    ::create();
    set( "gender", "男性" );
    set( "age", 30 + random( 30 ) );
    set( "long", "" );
    set( "attitude", "friendly" );
    set( "chat_chance", 30 );
    set( "chat_msg", ({ (: random_move:) }) );
    set( "chat_chance_combat", 120 );
    set( "scale", 150 );
    set( "no_get", 1 );

    set_temp( "apply/armor", 100 );
    set_temp( "apply/damage", 100 );
    set_temp( "born_time", time() );
    set_temp( "dest_time", 1800 + time() );

    add_money( "gold", 5 + random( 25 ) );

    fam_info = query( "fam_info" );

    if ( clonep() )
        keep_heart_beat();
}


void set_from_me( object me )
{
    int exp;
    mapping my;

    NPC_D->init_npc_skill( this_object(), NPC_D->check_level( me ) );
    my = query_entire_dbase();

    if ( my["max_qi"] > 10000 )
        my["max_qi"] = 10000;

    if ( my["max_jing"] < my["max_qi"] / 2 )
        my["max_jing"] = my["max_qi"] / 2;

    if ( my["max_jing"] > 6000 )
        my["max_jing"] = 6000;

    my["eff_jing"]  = my["max_jing"];
    my["jing"]  = my["max_jing"];
    my["eff_qi"]    = my["max_qi"];
    my["qi"]    = my["max_qi"];

    exp = me->query( "combat_exp" ) * 11 / 10;
    if ( exp > query( "combat_exp" ) )
        set( "combat_exp", exp );

    my["jiali"] = query_skill( "force" ) / 2;
}


int accept_fight( object ob )
{
    command( "say 我可没兴趣陪你玩，快给我滚开。" );
    return(0);
}


int accept_hit( object ob )
{
    command( "say 等我办完正事再来收拾你！" );
    return(0);
}


int accept_kill( object ob )
{
    object  *t;
    object  *our;
    object  killer;

    if ( !living( this_object() ) )
        return(1);

    fam_info = query( "fam_info" );

    /* 检查是否处于正在攻打状态 */
    if ( "/adm/daemons/story/familywar"->query_status() != ATTACKING )
    {
        if ( ob->query( "family/family_name" ) == fam_info["family"] )
        {
            command( "say 哼！我目前正在等待指令，等下再来取你性命。" );
            return(notify_fail( "看来，别人不屑与你交手。\n" ) );
        }else  {
            command( "heng" );
            return(notify_fail( "看来，别人不屑与你交手。\n" ) );
        }
    }else  { /* 只接受组队的玩家 */
        if ( !pointerp( t = ob->query_team() ) || !sizeof(t) || sizeof(t) < 2 )
        {
            command( "say 我从不和单枪匹马的人交手。" );
            return(notify_fail( "看来，别人不屑与你交手。\n" ) );
        }

        message_vision( HIW "$N" HIW "大声叫道：“兄弟们，大家一起上啊，杀了$n" HIW "这" +
                RANK_D->query_rude( this_object() ) + "！”\n" NOR, ob, this_object() );

        foreach( killer in t )
        {
            if ( objectp( killer ) &&
                 living( killer ) && !killer->is_fighting( this_object() ) )
                killer->kill_ob( this_object() );
        }

        our = filter_array( all_inventory( environment() ), (: objectp( $1 ) &&
                                     !wizardp( $1 ) &&
                                     environment( $1 ) &&
                                     $1->query( "team_num" ) &&
                                     living( $1 ) &&
                                     !playerp( $1 ) :) );
        killer = 0;
        foreach( killer in our )
        {
            if ( objectp( killer ) &&
                 living( killer ) && !killer->is_fighting( ob ) )
                killer->kill_ob( ob );
        }
    }

    return(1);
}


int accept_ansuan( object ob )
{
    return(notify_fail( "那人警惕性好高，你难以下手。\n" ) );
}


int accept_touxi( object ob )
{
    return(notify_fail( "那人警惕性好高，你难以下手。\n" ) );
}


void die( object killer )
{
    object  dob;            /* 打晕这个NPC的人 */
    int n;                  /* 可以奖励的人的数目 */
    int exp;                /* 需要瓜分的经验 */
    int pot;                /* 需要瓜分的潜能 */
    int weiwang;            /* 需要瓜分的威望 */
    int score;              /* 需要瓜分的阅历 */
    int gongxian;           /*  */
    object  *t;             /* 杀死我的人的队伍列表 */
    object  tob;
    // int i;

    /* 找到杀了我(NPC)或是打晕我的人 */
    if ( !objectp( dob = killer ) )
        dob = query_defeated_by();

    if ( !pointerp( t = dob->query_team() ) )
    {
        ::die();
        return;
    }

    if ( !sizeof(t) )
    {
        ::die();
        return;
    }

    if ( objectp( dob ) )
    {
        exp = 5000 + random( 5000 );
        pot = 2000 + random( 2000 );
        weiwang = 3000 + random( 6000 );
        score   = 3000 + random( 6000 );
        n   = sizeof(t);
        if ( !n || n < 4 )
        {
            exp /= 5;
            pot /= 5;
            weiwang /= 3;
            score   /= 3;
        }

        foreach( tob in t )
        {
            if ( objectp( tob ) && living( tob ) )
            {
                if ( tob->query( "family/family_name" ) == fam_info["family"] )
                    gongxian = 100 + random( 300 );

                else
                    gongxian = 0;

                GIFT_D->delay_bonus( tob,
                             (["exp"      : exp + ( (tob == dob) ? 2000 : 0),
                               "pot"      : pot + ( (tob == dob) ? 500 : 0),
                               "weiwang"  : weiwang + ( (tob == dob) ? 1000 : 0),
                               "score"    : score + ( (tob == dob) ? 1000 : 0),
                               "gongxian" : (n < 4 ? gongxian / 3 : gongxian),
                               "prompt"  : (pointerp( t ) ? "你的队伍击毙" + name() + "之后" :
                                    "击毙" + name() + "之后")]) );
            }
        }
        CHANNEL_D->do_channel( this_object(), "rumor",
                       sprintf( "听说%s攻进%s时被%s的队伍击毙了！",
                        name(), fam_info["family"], dob->query( "name" ) ) );
    }
    /* 正常死亡 */
    ::die();

    return;
}


void random_move()
{
    string  dir;
    string  * route;
    // object  master;
    object  *listeners;

    if ( time() > query_temp( "dest_time" ) ||
         "/adm/daemons/story/familywar"->query_status() == OVER )
    {
        message_vision( "$N急急忙忙的走了。\n", this_object() );
        CHANNEL_D->do_channel( this_object(), "rumor",
                       sprintf( "听说%s虽然成功的攻进%s，但也身受重伤，不得不退隐江湖闭关治疗。",
                        name(), fam_info["family"] ) );
        log_file( "static/killed_die", sprintf( "%s %s(%s) vanished because timeout(%d:%d).\n",
                            log_time(), name(), query( "id" ),
                            time() - query_temp( "born_time" ),
                            query_temp( "dest_time" ) - query_temp( "born_time" ) ) );
        destruct( this_object() );
        return;
    }

    if ( "/adm/daemons/story/familywar"->query_status() == WAITING )
    {
        listeners = filter_array( users(), (: filter_listener:) );

        if ( query( "is_leader" ) && random( 3 ) == 0 )
            message_vision( HIW "$N" HIW "说道：“弟兄们，不要着急，等下咱们攻入" +
                    fam_info["family"] + "，大开杀戒~！”\n" NOR, this_object() );
        else if ( random( 10 ) == 0 )
            message_vision( HIC "$N" HIC "嚷嚷道：“怎么首领还不下令攻打" +
                    fam_info["family"] + "我都等得不耐烦了！”\n" NOR, this_object() );

        return;
    }
    fam_info    = query( "fam_info" );
    route       = fam_info["route_list"];

    /* 已经走到终点 */
    if ( query( "move" ) >= sizeof(route) )
    {
        if ( base_name( environment() ) == fam_info["tar_room_fi"] )
        {
            if ( !this_object()->is_fighting() )
            {
                CHANNEL_D->do_channel( this_object(), "rumor",
                               "听说神秘组织攻到" + fam_info["family"] + "的" + fam_info["tar_room_nm"] +
                               "，" + fam_info["family"] + "自此元气大伤。\n" );
                FAMILY_D->add_family_fame( fam_info["family"], -1000 );
                "/adm/daemons/story/familywar"->change_status( OVER );
            }
        }

        return;
    }

    /* 按照路由列表移动 */
    if ( stringp( dir = route[query( "move" )] ) )
    {
        command( "say 兄弟们冲啊，杀得他们落花流水，片甲不留！" );
        if ( GO_CMD->main( this_object(), dir ) )
            add( "move", 1 );

        else if ( stringp( fam_info["spe_cmds"] ) )
            command( fam_info["spe_cmds"] );

        else return;
    }
}


void init()
{
    object me = this_player();

    fam_info = query( "fam_info" );

    if ( !living( me ) ||
         playerp( me ) ||
         me->query( "team_num" ) ||
         me->query( "family/family_name" ) != fam_info["family"] )
        return;

    if ( !"/cmds/std/kill"->main( this_object(), me->query( "id" ) ) )
        kill_ob( me );
}
