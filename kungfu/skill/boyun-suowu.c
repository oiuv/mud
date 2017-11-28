/* boyun-suowu 拨云锁雾 */

inherit SKILL;

mapping *action = ({
([	 "action" : "$N双手飘浮不定,突然从不可以思意的角度，拍向$n的胸口",
	 "dodge"  : 50,
	 "damage" : 30,
	 "lvl"    : 10,
	 "skill_name"  : "云里雾里",
	 "damage_type" : "瘀伤"
]),
([	 "action" : "$N长啸一声，平地飞起三丈，居高临下脚上头下，双手重叠在一起，运劲压向对手，$n大惊失色",
	 "dodge"  : 60,
	 "damage" : 50,
	 "skill_name"  : "拨开云雾",
	 "damage_type" : "瘀伤"
]),
([	 "action" : "$n眼前一花，失去$N的身影，只听见身后响起一阵掌风，只见$N双手同时拍中$n背门要害",
	 "dodge"  : 70,
	 "damage" : 40,
	 "skill_name"  : "迷云幽雾",
	 "damage_type" : "瘀伤"
]),
([	 "action" : "$N掌指齐出，拍拿并施，拿向$n的三路要害",
	 "dodge"  : 90,
	 "damage" : 50,
	 "lvl"    : 10,
	 "skill_name"  : "云深雾泽",
	 "damage_type" : "瘀伤"
]),
([	 "action" : "$N运气狂哮，四面八方出现无数掌影，一掌突出，夹着雷霆万钧之式拍向$n",
	 "dodge"  : 120,
	 "damage" : 100,
	 "lvl"    : 80,
	 "skill_name"  : "漫天云雾",
	 "damage_type" : "瘀伤"
]),
});

string *parry_msg = ({
	 "$N一招击在$n身上，却被$n随手破去。\n",
	 "$n轻轻一带，$N发现自己招数尽数落空。\n",
	 "$n左牵右引，$N如身处漩流，连续转了好几个圈。\n",
	 "$n轻轻一转，$N一招击在地上，只打得尘土飞扬。\n",
});

int valid_enable( string usage )
{
	return( (usage == "hand") || (usage == "parry") );
}

string query_parry_msg( string limb )
{
	return(parry_msg[random( sizeof(parry_msg) )]);
}

int valid_learn( object me )
{
	if ( me->query_temp( "weapon" ) || me->query_temp( "secondary_weapon" ) )
		return(notify_fail( "练拨云锁雾必需空手。\n" ) );

	if ( (int) me->query_skill( "biyun-xinfa", 1 ) < 10 )
		return(notify_fail( "你的碧云心法火候不够，无法学拨云锁雾。\n" ) );

	if ( me->query( "max_neili" ) < 100 )
		return(notify_fail( "你的内力太弱，无法练拨云锁雾。\n" ) );

	return(1);
}

string query_skill_name( int level )
{
	int i;
	for ( i = sizeof(action) - 1; i >= 0; i-- )
		if ( level >= action[i]["lvl"] )
			return(action[i]["skill_name"]);
}

mapping query_action( object me, object weapon )
{
/* d_e=dodge_effect p_e=parry_effect f_e=force_effect m_e=damage_effect */
	int	d_e1	= 20;
	int	d_e2	= 40;
	int	p_e1	= -35;
	int	p_e2	= 15;
	int	f_e1	= 200;
	int	f_e2	= 300;
	int	i, lvl, seq, ttl = sizeof(action);

	lvl = (int) me->query_skill( "boyun-suowu", 1 );
	for ( i = ttl; i > 0; i-- )
		if ( lvl > action[i - 1]["lvl"] )
		{
			seq = i;        /* 获得招数序号上限 */
			break;
		}
	seq = random( seq );            /* 选择出手招数序号 */
	return([
		       "action"      : action[seq]["action"],
		       "dodge"       : d_e1 + (d_e2 - d_e1) * seq / ttl,
		       "parry"       : p_e1 + (p_e2 - p_e1) * seq / ttl,
		       "force"       : f_e1 + (f_e2 - f_e1) * seq / ttl,
		       "damage_type" : random( 2 ) ? "内伤" : "瘀伤",
	       ]);
}

/*
 * int learn_bonus()
 * {
 * return(15);
 * }
 *
 * int practice_bonus()
 * {
 * return(15);
 * }
 *
 * int success()
 * {
 * return(15);
 * }
 *
 * int power_point( object me )
 * {
 * return(1.0);
 * }
 */

int practice_skill( object me )
{
	if ( me->query( "qi" ) < 30 )
		return(notify_fail( "你的体力太低了。\n" ) );

	if ( me->query( "neili" ) < 100 )
		return(notify_fail( "你的内力不够练拨云锁雾。\n" ) );

	me->receive_damage( "qi", 25 );
	return(1);
}

string perform_action_file( string action )
{
	return(__DIR__ "boyun-suowu/" + action);
}

int query_effect_parry( object attacker, object me )
{
	int lvl;

	lvl = me->query_skill( "boyun-suowu", 1 );
	if ( lvl < 80 )
		return(0);
	if ( lvl < 200 )
		return(50);
	if ( lvl < 280 )
		return(80);
	if ( lvl < 350 )
		return(100);
	return(120);
}
