// #pragma save_binary

// This file is part of the TMI mudlib distribution.
// Please include this header if you use this code.
// Written by Buddha@TMI, modularized and revised (92-05-01)
// Expanded to use a superior security system by Buddha (92-05-31)
// Temporary flag attribute system added by Watcher (93-02-21)
// Altered by Pallando @ Tabor (93-03-17)
// Changed to return current value in _set() by Annihilator (95-03-15)
// NB these functions don't have to be nomask if you prevent objects shadowing
// them in the same circumstances that shadowing query is not allowed.

nomask mixed _query( mapping map, string *parts )
{
	mixed value;
	int i, s;

	value = map;
	s = sizeof( parts );
	for( i = 0 ; i < s ; i++ ) {
		if( undefinedp( value = value[parts[i]] ) )
			break;
		if( !mapp( value ) )
			break;
	}
	return value;
}

nomask int _delete( mapping map, string *parts )
{
	if( sizeof( parts ) == 1 ) {
		map_delete( map, parts[0] );
		return 1;
	}
	if( !map[parts[0]] || !mapp( map[parts[0]] ) )
		return 0;
	return _delete( map[parts[0]], parts[1..sizeof(parts)-1] );
}

nomask mixed _set( mapping map, string *parts, mixed value )
{
	if( sizeof( parts ) == 1 )
		return map[parts[0]] = value;

	if( !map[parts[0]] || !mapp( map[parts[0]] ) )
		map[parts[0]] = ([ parts[1] : 0 ]);

	return _set( map[parts[0]], parts[1..sizeof(parts)-1], value );
}
